<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import * as OBC from '@thatopen/components';
import LoadIfcButton from '../components/LoadIfcButton.vue';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { CanvasUI } from '../helpers/CanvasUI.js';
import skyBox from '../helpers/skybox.js';

export default {
  name: 'IfcVR',
  components: { LoadIfcButton },
  setup() {
    const viewerContainer = ref(null);
    let components = null;
    let world = null;
    let fragments = null;
    let ifcLoader = null;

    const loadIfcFile = async (change) => {
      const file = change.target.files[0];
      if (!file) return;
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      await ifcLoader.load(data, true, file.name);
    };

    onMounted(async () => {
      components = new OBC.Components();
      const worlds = components.get(OBC.Worlds);

      world = worlds.create();
      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(components, viewerContainer.value);
      world.camera = new OBC.SimpleCamera(components);

      world.scene.setup();
      world.camera.controls.setLookAt(0, 1.6, 10, 0, 0, 0);

      const renderer = world.renderer.three;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;

      // Lights & skybox
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.8);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 10, 0);
      world.scene.three.add(ambientLight);
      world.scene.three.add(hemisphereLight);
      world.scene.three.add(directionalLight);
      world.scene.three.add(skyBox);

      // Grids
      const grid = new THREE.GridHelper(50, 50);
      const axes = new THREE.AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 1;
      world.scene.three.add(grid);
      world.scene.three.add(axes);

      // Setup FragmentsManager (must init before IfcLoader)
      fragments = components.get(OBC.FragmentsManager);
      const workerUrl = "https://thatopen.github.io/engine_fragment/resources/worker.mjs";
      const fetchedWorker = await fetch(workerUrl);
      const workerBlob = await fetchedWorker.blob();
      const workerFile = new File([workerBlob], "worker.mjs", { type: "text/javascript" });
      const workerObjectUrl = URL.createObjectURL(workerFile);
      fragments.init(workerObjectUrl);

      world.camera.controls.addEventListener("update", () => fragments.core.update());
      fragments.list.onItemSet.add(({ value: model }) => {
        model.useCamera(world.camera.three);
        world.scene.three.add(model.object);
        fragments.core.update(true);
      });

      // Setup IFC loader
      ifcLoader = components.get(OBC.IfcLoader);
      await ifcLoader.setup({ autoSetWasm: false, wasm: { path: "/wasm/", absolute: true } });

      // VR setup
      renderer.xr.enabled = true;
      document.body.appendChild(VRButton.createButton(renderer));

      // VR Controllers
      const controllerModelFactory = new XRControllerModelFactory();
      const controller1 = renderer.xr.getController(0);
      const controller2 = renderer.xr.getController(1);

      const controllerGrip1 = renderer.xr.getControllerGrip(0);
      controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
      const controllerGrip2 = renderer.xr.getControllerGrip(1);
      controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));

      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1)
      ]);
      const line = new THREE.Line(geometry);
      line.name = 'line';
      line.scale.z = 5;

      controller1.add(line.clone());
      controller2.add(line.clone());

      world.scene.three.add(controller1);
      world.scene.three.add(controller2);
      world.scene.three.add(controllerGrip1);
      world.scene.three.add(controllerGrip2);

      // VR picking is not yet supported with ThatOpen fragments raycaster
      // Controllers are available for movement only

      // Movement with squeeze
      const dolly = world.camera.three.parent || world.camera.three;
      let letUserMove = false;
      controller1.addEventListener('squeezestart', () => { letUserMove = true; });
      controller1.addEventListener('squeezeend', () => { letUserMove = false; });

      const clock = new THREE.Clock();
      renderer.setAnimationLoop(() => {
        const dt = clock.getDelta();
        if (letUserMove) {
          const speed = 2;
          const dir = new THREE.Vector3();
          world.camera.three.getWorldDirection(dir);
          dir.negate();
          dolly.position.addScaledVector(dir, -dt * speed);
        }
        renderer.render(world.scene.three, world.camera.three);
      });

      components.init();

      return { viewerContainer };
    });

    onBeforeUnmount(() => {
      const vrBtn = document.getElementById('VRButton');
      if (vrBtn) document.body.removeChild(vrBtn);
      if (components) components.dispose();
    });

    return { viewerContainer, loadIfcFile };
  }
};
</script>

<template>
  <div class="relative w-full h-screen">
    <div ref="viewerContainer" class="absolute inset-0 w-full h-full"></div>
    <div class="absolute top-0 left-0 right-0 z-10 pl-5 pr-5 pt-12 pointer-events-none">
      <div class="pointer-events-auto">
        <LoadIfcButton :loadFunction="loadIfcFile" />
      </div>
    </div>
    <div class="absolute top-20 left-5 z-10" id="message-container">
      <p id="id-output">_</p>
      <p id="desc-output">_</p>
    </div>
  </div>
</template>
