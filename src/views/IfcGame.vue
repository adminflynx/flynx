<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import * as OBC from '@thatopen/components';
import LoadIfcButton from '../components/LoadIfcButton.vue';
import IfcThree from '../components/IfcThree.vue';
import { JoyStick } from '../helpers/Toon3D.js';
import { setupHighlighter, setupSelectionEvents } from '../helpers/MousePicker.js';
import { useStore } from '../store/index.js';

export default {
  name: 'IfcGame',
  components: { LoadIfcButton, IfcThree },
  setup() {
    const viewerContainer = ref(null);
    const store = useStore();
    const obcComponents = ref(null);
    const hasModel = ref(false);

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
      hasModel.value = true;
    };

    onMounted(async () => {
      components = new OBC.Components();
      const worlds = components.get(OBC.Worlds);

      world = worlds.create();
      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(components, viewerContainer.value);
      world.camera = new OBC.SimpleCamera(components);

      world.scene.setup();
      world.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);

      const renderer = world.renderer.three;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;

      // Lights
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.8);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 10, 0);
      world.scene.three.add(ambientLight);
      world.scene.three.add(hemisphereLight);
      world.scene.three.add(directionalLight);

      // Grid & axes
      const grid = new THREE.GridHelper(50, 30);
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

      // Highlighter (replaces manual raycasting)
      const highlighter = await setupHighlighter(components, world);
      const outputId = document.getElementById('id-output');
      const outputDesc = document.getElementById('desc-output');
      setupSelectionEvents(components, highlighter, outputId, outputDesc);

      // Joystick for movement using camera-controls
      const joystick = new JoyStick({
        onMove: (forward, turn) => {
          const controls = world.camera.controls;
          controls.forward(forward * 0.15, false);
          controls.rotate(turn * -0.02, 0, false);
        },
      });

      // Expose components to template for IfcThree
      obcComponents.value = components;

      components.init();
    });

    onBeforeUnmount(() => {
      const theJoystick = document.getElementById('joystick');
      if (theJoystick) document.body.removeChild(theJoystick);
      if (components) components.dispose();
    });

    return { viewerContainer, loadIfcFile, store, obcComponents, hasModel };
  }
};
</script>

<template>
  <div class="relative w-full h-screen">
    <div ref="viewerContainer" class="absolute inset-0 w-full h-full"></div>
    <div class="absolute top-0 left-0 right-0 z-10 p-5 mt-10 pointer-events-none">
      <div class="flex p-5 font-semibold justify-center text-cyan-600 hidden sm:flex">Ifc XR made for wilmercampagna
        <button class="pointer-events-auto">
          <img src="../assets/logo.png" alt="Logo" class="h-5 w-5 mr-2 ml-2">
        </button>
        in collaboration with GRUA
        <button class="pointer-events-auto">
          <img src="../assets/grua.png" alt="Logo" class="h-6 mr-2 ml-2">
        </button>
      </div>
      <div class="pointer-events-auto">
        <LoadIfcButton :loadFunction="loadIfcFile" />
      </div>

      <div id="message-container">
        <p id="id-output">_</p>
        <p id="desc-output">_</p>
      </div>
      <div v-if="hasModel && store.showIfcData && obcComponents" class="pointer-events-auto">
        <IfcThree :components="obcComponents" />
      </div>
    </div>
  </div>
</template>
