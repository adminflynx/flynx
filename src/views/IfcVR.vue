<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import * as OBC from '@thatopen/components';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import LoadIfcButton from '../components/LoadIfcButton.vue';
import { CanvasUI } from '../helpers/CanvasUI.js';
import skyBox from '../helpers/skybox.js';

const viewerContainer = ref(null);
const selectedInfo = ref({ id: '', model: '' });

let components = null;
let world = null;
let renderer = null;
let scene = null;
let camera = null;
let fragments = null;
let ifcLoader = null;
let vrButtonEl = null;
let propMesh = null;

const dolly = new THREE.Group();
const cameraDolly = new THREE.Group();

const loadIfcFile = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  await ifcLoader.load(data, true, file.name);
  event.target.value = '';
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

  renderer = world.renderer.three;
  scene = world.scene.three;
  camera = world.camera.three;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(0, 10, 0);
  scene.add(dirLight);
  scene.add(skyBox);

  // Ground
  const groundGeo = new THREE.PlaneGeometry(50, 50);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x808080, transparent: true, opacity: 0.3 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Grid
  const grid = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
  scene.add(grid);

  // FragmentsManager
  fragments = components.get(OBC.FragmentsManager);
  const workerUrl = 'https://thatopen.github.io/engine_fragment/resources/worker.mjs';
  const fetchedWorker = await fetch(workerUrl);
  const workerBlob = await fetchedWorker.blob();
  const workerFile = new File([workerBlob], 'worker.mjs', { type: 'text/javascript' });
  fragments.init(URL.createObjectURL(workerFile));
  world.camera.controls.addEventListener('update', () => fragments.core.update());
  fragments.list.onItemSet.add(({ value: model }) => {
    model.useCamera(camera);
    scene.add(model.object);
    fragments.core.update(true);
  });

  // IfcLoader
  ifcLoader = components.get(OBC.IfcLoader);
  await ifcLoader.setup({ autoSetWasm: false, wasm: { path: '/wasm/', absolute: true } });

  // VR setup
  // Make WebGL context XR-compatible BEFORE creating the VR button
  renderer.xr.enabled = true;
  const gl = renderer.getContext();
  if (gl && typeof gl.makeXRCompatible === 'function') {
    try { await gl.makeXRCompatible(); } catch (e) { /* noop */ }
  }
  vrButtonEl = VRButton.createButton(renderer);
  vrButtonEl.style.bottom = '20px';
  vrButtonEl.style.right = '20px';
  vrButtonEl.style.left = 'auto';
  document.body.appendChild(vrButtonEl);

  // Set reference space
  renderer.xr.setReferenceSpaceType('local-floor');

  // Camera dolly for locomotion
  cameraDolly.add(camera);
  scene.add(cameraDolly);
  scene.add(dolly);

  // Controllers
  const controllerModelFactory = new XRControllerModelFactory();
  const controller1 = renderer.xr.getController(0); // typically left
  const controller2 = renderer.xr.getController(1); // typically right
  const grip1 = renderer.xr.getControllerGrip(0);
  const grip2 = renderer.xr.getControllerGrip(1);
  grip1.add(controllerModelFactory.createControllerModel(grip1));
  grip2.add(controllerModelFactory.createControllerModel(grip2));

  // Aim line
  const lineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);
  const aimLine = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({ color: 0xbcf124 }));
  aimLine.scale.z = 5;
  controller1.add(aimLine.clone());
  controller2.add(aimLine.clone());

  cameraDolly.add(controller1);
  cameraDolly.add(controller2);
  cameraDolly.add(grip1);
  cameraDolly.add(grip2);

  // Picking via fragments
  const raycaster = new THREE.Raycaster();
  const tempMatrix = new THREE.Matrix4();

  // CanvasUI for property panel in VR
  const ui = new CanvasUI(
    { body: 'Selecciona un elemento' },
    {
      panelSize: { width: 0.6, height: 0.4 },
      width: 512, height: 256,
      body: { type: 'text', position: { x: 16, y: 16 }, width: 480, height: 224, fontSize: 22, padding: 12, backgroundColor: '#1e293b', color: '#fff' },
    }
  );
  ui.mesh.position.set(0, 1.4, -1);
  ui.mesh.visible = false;
  cameraDolly.add(ui.mesh);

  const triggerHaptic = (controller, intensity = 0.5, duration = 50) => {
    const gp = controller.gamepad;
    if (gp?.hapticActuators?.[0]) {
      gp.hapticActuators[0].pulse(intensity, duration).catch(() => {});
    }
  };

  const handlePick = async (event) => {
    const controller = event.target;
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    // Try fragments raycaster
    try {
      const result = await fragments.core.raycast({
        camera,
        mouse: { x: 0, y: 0 }, // not used when ray provided
        dom: viewerContainer.value,
        useFragments: true,
      });
      if (result?.localId) {
        ui.updateElement('body', `ExpressID: ${result.localId}\nModel: ${result.modelId || 'N/A'}`);
        ui.update();
        ui.mesh.visible = true;
        triggerHaptic(controller, 0.6, 30);
        selectedInfo.value = { id: result.localId, model: result.modelId };
        return;
      }
    } catch (err) { /* fall through to manual ray */ }

    // Fallback: manual ray on visible meshes
    const meshes = [];
    scene.traverse((c) => { if (c.isMesh) meshes.push(c); });
    const intersects = raycaster.intersectObjects(meshes);
    if (intersects.length > 0) {
      const hit = intersects[0];
      const id = hit.object.userData?.expressID || 'N/A';
      ui.updateElement('body', `ID: ${id}\nObject: ${hit.object.name || 'mesh'}`);
      ui.update();
      ui.mesh.visible = true;
      triggerHaptic(controller, 0.6, 30);
    }
  };

  const hidePick = () => {
    ui.mesh.visible = false;
  };

  controller1.addEventListener('selectstart', handlePick);
  controller2.addEventListener('selectstart', handlePick);

  // Movement state
  const moveState = { forward: 0, strafe: 0, turn: 0, snapTurnReady: true, teleport: false };
  const teleportTarget = new THREE.Vector3();
  const teleportRing = new THREE.Mesh(
    new THREE.RingGeometry(0.2, 0.25, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.7 })
  );
  teleportRing.visible = false;
  scene.add(teleportRing);

  // Squeeze on right controller for teleport
  controller2.addEventListener('squeezestart', () => { moveState.teleport = true; });
  controller2.addEventListener('squeezeend', () => {
    if (moveState.teleport && teleportRing.visible) {
      cameraDolly.position.copy(teleportTarget);
      triggerHaptic(controller2, 0.8, 60);
    }
    moveState.teleport = false;
    teleportRing.visible = false;
  });

  // Read gamepad each frame
  const updateGamepads = () => {
    const session = renderer.xr.getSession();
    if (!session) return;

    for (const source of session.inputSources) {
      if (!source.gamepad) continue;
      const axes = source.gamepad.axes;
      // axes: [touchX, touchY, thumbstickX, thumbstickY]
      const tx = axes[2] || 0;
      const ty = axes[3] || 0;
      const handed = source.handedness;
      if (handed === 'left') {
        moveState.forward = -ty; // forward when stick up
        moveState.strafe = tx;
      } else if (handed === 'right') {
        moveState.turn = tx;
      }
    }
  };

  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();

    if (renderer.xr.isPresenting) {
      updateGamepads();

      // Smooth locomotion (left thumbstick)
      const speed = 1.5;
      if (Math.abs(moveState.forward) > 0.1 || Math.abs(moveState.strafe) > 0.1) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        dir.y = 0;
        dir.normalize();
        const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
        cameraDolly.position.addScaledVector(dir, moveState.forward * speed * dt);
        cameraDolly.position.addScaledVector(right, moveState.strafe * speed * dt);
      }

      // Snap-turn (right thumbstick X)
      if (Math.abs(moveState.turn) > 0.7 && moveState.snapTurnReady) {
        const angle = moveState.turn > 0 ? -Math.PI / 6 : Math.PI / 6;
        cameraDolly.rotateY(angle);
        moveState.snapTurnReady = false;
      } else if (Math.abs(moveState.turn) < 0.3) {
        moveState.snapTurnReady = true;
      }

      // Teleport arc preview
      if (moveState.teleport) {
        tempMatrix.identity().extractRotation(controller2.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller2.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        const groundIntersect = raycaster.intersectObject(ground);
        if (groundIntersect.length > 0) {
          teleportTarget.copy(groundIntersect[0].point);
          teleportRing.position.copy(teleportTarget);
          teleportRing.visible = true;
        } else {
          teleportRing.visible = false;
        }
      }
    }

    renderer.render(scene, camera);
  });

  components.init();
});

onBeforeUnmount(() => {
  if (vrButtonEl && vrButtonEl.parentNode) vrButtonEl.parentNode.removeChild(vrButtonEl);
  if (components) components.dispose();
});
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden">
    <div ref="viewerContainer" class="absolute inset-0 w-full h-full"></div>

    <!-- Top status bar -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-sm shadow-lg">
        <mdicon name="virtual-reality" size="18" />
        <span>VR Mode</span>
      </div>
    </div>

    <!-- File loader -->
    <div class="absolute top-20 left-0 right-0 z-20 px-6 pointer-events-none">
      <div class="pointer-events-auto">
        <LoadIfcButton :loadFunction="loadIfcFile" />
      </div>
    </div>

    <!-- Controls help -->
    <div class="absolute bottom-20 left-4 z-20 max-w-xs">
      <div class="p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs space-y-1.5">
        <div class="font-semibold mb-2 flex items-center gap-2">
          <mdicon name="controller" size="16" /> Controles VR
        </div>
        <div class="flex items-center gap-2"><mdicon name="circle-double" size="14" class="text-cyan-400" /> Stick izq: mover</div>
        <div class="flex items-center gap-2"><mdicon name="circle-double" size="14" class="text-cyan-400" /> Stick der: snap-turn</div>
        <div class="flex items-center gap-2"><mdicon name="hand-pointing-up" size="14" class="text-purple-400" /> Trigger: seleccionar</div>
        <div class="flex items-center gap-2"><mdicon name="map-marker-radius" size="14" class="text-emerald-400" /> Squeeze der: teleport</div>
      </div>
    </div>

    <!-- Selected info -->
    <div v-if="selectedInfo.id" class="absolute top-32 left-4 z-20">
      <div class="p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
        <div class="font-semibold mb-1">Elemento seleccionado</div>
        <div>ID: {{ selectedInfo.id }}</div>
        <div>Model: {{ selectedInfo.model }}</div>
      </div>
    </div>
  </div>
</template>
