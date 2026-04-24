<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import * as OBC from '@thatopen/components';
import CameraControls from 'camera-controls';
import LoadIfcButton from '../components/LoadIfcButton.vue';
import IfcThree from '../components/IfcThree.vue';
import { setupHighlighter, setupSelectionEvents } from '../helpers/MousePicker.js';
import { createGrassTerrain } from '../helpers/GrassTerrain.js';
import { JoyStick } from '../helpers/Toon3D.js';
import { useStore } from '../store/index.js';

const viewerContainer = ref(null);
const store = useStore();
const obcComponents = ref(null);
const hasModel = ref(false);

// Navigation mode: 'orbit' | 'thirdPerson' | 'fly'
const navMode = ref('orbit');

// Mobile detection
const isMobile = ref(typeof window !== 'undefined' && (
  'ontouchstart' in window || navigator.maxTouchPoints > 0
));

// Joystick movement state (continuous from mobile)
const joyMove = { forward: 0, strafe: 0 };

let components = null;
let world = null;
let fragments = null;
let ifcLoader = null;
let cameraControls = null;

// Keyboard state
const keys = {
  w: false, a: false, s: false, d: false, q: false, e: false,
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
};
let yVelocity = 0;
let isGrounded = false;
let jumpRequested = false;

const onKeyDown = (e) => {
  if (navMode.value === 'orbit') return;
  if (e.repeat) return;
  switch (e.code) {
    case 'KeyW': keys.w = true; break;
    case 'KeyA': keys.a = true; break;
    case 'KeyS': keys.s = true; break;
    case 'KeyD': keys.d = true; break;
    case 'KeyQ': keys.q = true; break;
    case 'KeyE': keys.e = true; break;
    case 'ArrowUp': keys.ArrowUp = true; e.preventDefault(); break;
    case 'ArrowDown': keys.ArrowDown = true; e.preventDefault(); break;
    case 'ArrowLeft': keys.ArrowLeft = true; e.preventDefault(); break;
    case 'ArrowRight': keys.ArrowRight = true; e.preventDefault(); break;
    case 'Space':
      jumpRequested = true;
      e.preventDefault();
      break;
  }
};

const onKeyUp = (e) => {
  switch (e.code) {
    case 'KeyW': keys.w = false; break;
    case 'KeyA': keys.a = false; break;
    case 'KeyS': keys.s = false; break;
    case 'KeyD': keys.d = false; break;
    case 'KeyQ': keys.q = false; break;
    case 'KeyE': keys.e = false; break;
    case 'ArrowUp': keys.ArrowUp = false; break;
    case 'ArrowDown': keys.ArrowDown = false; break;
    case 'ArrowLeft': keys.ArrowLeft = false; break;
    case 'ArrowRight': keys.ArrowRight = false; break;
  }
};

const resetKeys = () => {
  for (const k of Object.keys(keys)) keys[k] = false;
  yVelocity = 0;
  isGrounded = false;
  jumpRequested = false;
};

// Apply mouse/touch button mapping for the given navigation mode.
const applyModeControls = (mode) => {
  if (!cameraControls) return;
  const A = CameraControls.ACTION;
  if (mode === 'orbit') {
    // Default orbit-style controls
    cameraControls.mouseButtons.left = A.ROTATE;
    cameraControls.mouseButtons.middle = A.DOLLY;
    cameraControls.mouseButtons.right = A.TRUCK;
    cameraControls.mouseButtons.wheel = A.DOLLY;
    cameraControls.touches.one = A.TOUCH_ROTATE;
    cameraControls.touches.two = A.TOUCH_DOLLY_TRUCK;
    cameraControls.touches.three = A.TOUCH_TRUCK;
  } else {
    // thirdPerson + fly: keyboard-driven, mouse can still rotate the camera
    cameraControls.mouseButtons.left = A.ROTATE;
    cameraControls.mouseButtons.middle = A.NONE;
    cameraControls.mouseButtons.right = A.NONE;
    cameraControls.mouseButtons.wheel = A.DOLLY;
    cameraControls.touches.one = A.TOUCH_ROTATE;
    cameraControls.touches.two = A.NONE;
    cameraControls.touches.three = A.NONE;
  }
};

// Switch mode and update OBC controls behavior
watch(navMode, (mode) => {
  resetKeys();
  applyModeControls(mode);
});

const loadIfcFile = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  await ifcLoader.load(data, true, file.name);
  hasModel.value = true;
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
  world.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);

  const renderer = world.renderer.three;
  const scene = world.scene.three;
  const camera = world.camera.three;
  cameraControls = world.camera.controls;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  // Lights
  scene.add(new THREE.AmbientLight(0x404040, 0.5));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.8));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, 0);
  scene.add(directionalLight);

  // Grid & axes
  const grid = new THREE.GridHelper(50, 30);
  const axes = new THREE.AxesHelper();
  axes.material.depthTest = false;
  axes.renderOrder = 1;
  scene.add(grid);
  scene.add(axes);

  // Procedural grass terrain spawner — uses OBC BoundingBoxer for reliable bounds
  let terrainMesh = null;
  const removeTerrain = () => {
    if (!terrainMesh) return;
    scene.remove(terrainMesh);
    terrainMesh.geometry.dispose();
    terrainMesh.material.map?.dispose();
    terrainMesh.material.dispose();
    terrainMesh = null;
  };

  const buildTerrain = ({ minY, cx, cz, span }) => {
    removeTerrain();
    terrainMesh = createGrassTerrain({
      size: span,
      centerX: cx,
      centerY: minY - 0.001,
      centerZ: cz,
      repeat: Math.max(20, Math.round(span / 5)),
    });
    scene.add(terrainMesh);
    grid.visible = false;
  };

  const spawnTerrainForModel = async () => {
    let bounds = null;
    // Try OBC BoundingBoxer first (works with fragment models)
    try {
      const boxer = components.get(OBC.BoundingBoxer);
      boxer.list.clear();
      await boxer.addFromModels();
      const box = boxer.get();
      boxer.list.clear();
      if (box && isFinite(box.min.y) && isFinite(box.max.y)) {
        bounds = {
          minY: box.min.y,
          cx: (box.min.x + box.max.x) / 2,
          cz: (box.min.z + box.max.z) / 2,
          span: Math.max(box.max.x - box.min.x, box.max.z - box.min.z, 50) * 4,
        };
      }
    } catch (err) {
      console.warn('BoundingBoxer failed, using defaults:', err);
    }

    // Fallback: scan scene meshes manually
    if (!bounds) {
      const tempBox = new THREE.Box3();
      const meshBox = new THREE.Box3();
      let found = false;
      scene.traverse((c) => {
        if (c.isMesh && c !== grid && c !== axes && c !== terrainMesh) {
          meshBox.setFromObject(c);
          if (isFinite(meshBox.min.y)) {
            if (!found) tempBox.copy(meshBox);
            else tempBox.union(meshBox);
            found = true;
          }
        }
      });
      if (found) {
        bounds = {
          minY: tempBox.min.y,
          cx: (tempBox.min.x + tempBox.max.x) / 2,
          cz: (tempBox.min.z + tempBox.max.z) / 2,
          span: Math.max(tempBox.max.x - tempBox.min.x, tempBox.max.z - tempBox.min.z, 50) * 4,
        };
      }
    }

    // Final fallback: large terrain at origin
    if (!bounds) {
      bounds = { minY: 0, cx: 0, cz: 0, span: 200 };
    }

    buildTerrain(bounds);
  };

  // FragmentsManager
  fragments = components.get(OBC.FragmentsManager);
  const workerUrl = 'https://thatopen.github.io/engine_fragment/resources/worker.mjs';
  const fetchedWorker = await fetch(workerUrl);
  const workerBlob = await fetchedWorker.blob();
  const workerFile = new File([workerBlob], 'worker.mjs', { type: 'text/javascript' });
  fragments.init(URL.createObjectURL(workerFile));

  cameraControls.addEventListener('update', () => fragments.core.update());
  fragments.list.onItemSet.add(({ value: model }) => {
    model.useCamera(camera);
    scene.add(model.object);
    fragments.core.update(true);
    // Try a couple of times in case bounds aren't ready immediately
    setTimeout(() => spawnTerrainForModel(), 600);
    setTimeout(() => spawnTerrainForModel(), 2000);
  });

  // IFC loader
  ifcLoader = components.get(OBC.IfcLoader);
  await ifcLoader.setup({ autoSetWasm: false, wasm: { path: '/wasm/', absolute: true } });

  // Apply default orbit controls explicitly (so left-click rotates from the start)
  applyModeControls(navMode.value);

  // Highlighter
  const highlighter = await setupHighlighter(components, world);
  const outputId = document.getElementById('id-output');
  const outputDesc = document.getElementById('desc-output');
  setupSelectionEvents(components, highlighter, outputId, outputDesc);

  // ── Keyboard movement + physics ──
  const moveSpeed = 5;       // m/s for WASD
  const verticalSpeed = 4;   // m/s for Q/E
  const lookSpeed = 1.5;     // rad/s for arrow keys
  const jumpVelocity = 5;    // initial jump impulse
  const gravity = -12;       // m/s^2
  const eyeHeight = 1.6;
  const raycaster = new THREE.Raycaster();
  const downDir = new THREE.Vector3(0, -1, 0);
  const camPos = new THREE.Vector3();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // Only use the procedural terrain for ground raycasting.
  // Fragment meshes have non-standard buffer attributes that crash THREE's raycaster.
  const getGroundTargets = () => {
    return terrainMesh ? [terrainMesh] : [];
  };

  // Safe raycast that swallows BVH/buffer errors from fragment meshes.
  const safeIntersect = (objects) => {
    try {
      return raycaster.intersectObjects(objects, false);
    } catch (err) {
      return [];
    }
  };

  // ── Mouse-look (pointer lock) for walk + fly modes ──
  const mouseSensitivity = 0.0025;
  let pointerLocked = false;
  const lookDir = new THREE.Vector3();
  const fpTarget = new THREE.Vector3();

  // Snap the camera-controls target to ~0.5m in front of camera so rotation
  // pivots around the camera position (true first-person look) instead of
  // orbiting around a faraway point.
  const snapTargetToCamera = () => {
    camera.getWorldPosition(camPos);
    camera.getWorldDirection(lookDir);
    fpTarget.copy(camPos).addScaledVector(lookDir, 0.5);
    cameraControls.setTarget(fpTarget.x, fpTarget.y, fpTarget.z, false);
  };

  const onPointerLockChange = () => {
    pointerLocked = document.pointerLockElement === viewerContainer.value;
    if (pointerLocked) snapTargetToCamera();
  };

  const onMouseMove = (e) => {
    if (!pointerLocked) return;
    if (navMode.value === 'orbit') return;
    const dx = e.movementX || 0;
    const dy = e.movementY || 0;
    if (dx === 0 && dy === 0) return;
    // Negative because rotate() orbits the camera around the target.
    // With target snapped close, this becomes equivalent to FPS look.
    cameraControls.rotate(-dx * mouseSensitivity, -dy * mouseSensitivity, false);
  };

  const requestPointerLock = () => {
    if (navMode.value === 'orbit') return;
    if (!pointerLocked && viewerContainer.value?.requestPointerLock) {
      viewerContainer.value.requestPointerLock();
    }
  };

  const onCanvasClick = () => requestPointerLock();

  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('mousemove', onMouseMove);
  viewerContainer.value.addEventListener('click', onCanvasClick);

  // ── Mobile JoyStick ──
  let joystickInstance = null;

  const setupMobileJoystick = () => {
    if (!isMobile.value) return;
    if (joystickInstance) return;
    joystickInstance = new JoyStick({
      onMove: (forward, turn) => {
        // forward = vertical axis, turn = horizontal axis (use as strafe)
        joyMove.forward = forward;
        joyMove.strafe = turn;
      },
    });
  };

  const teardownMobileJoystick = () => {
    const el = document.getElementById('joystick');
    if (el) el.remove();
    joystickInstance = null;
    joyMove.forward = 0;
    joyMove.strafe = 0;
  };

  // Snap target close when entering keyboard modes; release pointer lock when leaving
  watch(navMode, (mode) => {
    if (mode === 'orbit') {
      if (pointerLocked) document.exitPointerLock?.();
      teardownMobileJoystick();
    } else {
      snapTargetToCamera();
      setupMobileJoystick();
    }
  });

  const clock = new THREE.Clock();
  const updateMovement = () => {
    const dt = Math.min(clock.getDelta(), 0.1);

    if (navMode.value === 'orbit') return;

    // Keep the target close to the camera so rotation pivots like FPS-look.
    snapTargetToCamera();

    // Camera rotation with arrow keys (both walk + fly)
    let yaw = 0;
    let pitch = 0;
    if (keys.ArrowLeft) yaw += 1;
    if (keys.ArrowRight) yaw -= 1;
    if (keys.ArrowUp) pitch += 1;
    if (keys.ArrowDown) pitch -= 1;
    if (yaw !== 0 || pitch !== 0) {
      cameraControls.rotate(yaw * lookSpeed * dt, -pitch * lookSpeed * dt, false);
    }

    // Horizontal movement (keyboard + mobile joystick)
    let forward = 0;
    let strafe = 0;
    if (keys.w) forward += 1;
    if (keys.s) forward -= 1;
    if (keys.d) strafe += 1;
    if (keys.a) strafe -= 1;
    // Joystick adds analog input (already normalized between -1..1)
    forward += joyMove.forward;
    strafe += joyMove.strafe;
    const flySpeed = navMode.value === 'fly' ? moveSpeed * 1.6 : moveSpeed;
    if (forward !== 0 || strafe !== 0) {
      const mag = Math.hypot(forward, strafe);
      const clamped = Math.min(mag, 1);
      forward = (forward / mag) * clamped;
      strafe = (strafe / mag) * clamped;
      cameraControls.forward(forward * flySpeed * dt, false);
      cameraControls.truck(strafe * flySpeed * dt, 0, false);
    }

    // ── FLY MODE: free vertical movement, no physics ──
    if (navMode.value === 'fly') {
      const flyVertical = verticalSpeed * 1.5;
      if (keys.e) cameraControls.elevate(flyVertical * dt, false);
      if (keys.q) cameraControls.elevate(-flyVertical * dt, false);
      // No gravity, no jump, no ground detection
      jumpRequested = false;
      yVelocity = 0;
      isGrounded = false;
      return;
    }

    // ── THIRD-PERSON MODE: physics, gravity, jump ──

    // Q/E vertical (only when grounded, otherwise gravity wins)
    if (isGrounded && yVelocity === 0) {
      if (keys.e) {
        cameraControls.elevate(verticalSpeed * dt, false);
        isGrounded = false;
      }
      if (keys.q) cameraControls.elevate(-verticalSpeed * dt, false);
    }

    // Detect ground beneath camera (uses terrain mesh only, safely)
    camera.getWorldPosition(camPos);
    raycaster.set(camPos, downDir);
    const hits = safeIntersect(getGroundTargets());
    const groundHit = hits.length > 0 ? hits[0] : null;

    // Jump request
    if (jumpRequested) {
      if (isGrounded) {
        yVelocity = jumpVelocity;
        isGrounded = false;
      }
      jumpRequested = false;
    }

    // Apply gravity if airborne
    if (!isGrounded || yVelocity !== 0) {
      yVelocity += gravity * dt;
      const dy = yVelocity * dt;
      if (groundHit) {
        const targetY = groundHit.point.y + eyeHeight;
        const newY = camPos.y + dy;
        if (newY <= targetY && yVelocity <= 0) {
          cameraControls.elevate(targetY - camPos.y, false);
          yVelocity = 0;
          isGrounded = true;
        } else {
          cameraControls.elevate(dy, false);
          isGrounded = false;
        }
      } else {
        cameraControls.elevate(dy, false);
        isGrounded = false;
      }
    } else if (groundHit) {
      // Snap if hovering slightly
      const dist = camPos.y - (groundHit.point.y + eyeHeight);
      if (dist > 0.05 && dist < 0.5) {
        cameraControls.elevate(-dist, false);
      }
      // Walked off an edge
      if (groundHit.distance > eyeHeight + 0.2) {
        isGrounded = false;
      }
    }
  };

  renderer.setAnimationLoop(() => {
    updateMovement();
    renderer.render(scene, camera);
  });

  obcComponents.value = components;
  components.init();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  if (document.pointerLockElement) document.exitPointerLock?.();
  const joystickEl = document.getElementById('joystick');
  if (joystickEl) joystickEl.remove();
  if (components) components.dispose();
});
</script>

<template>
  <div class="relative w-full h-screen">
    <div ref="viewerContainer" class="absolute inset-0 w-full h-full"></div>

    <!-- Top bar -->
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

    <!-- Navigation mode switch (compact icon-only) -->
    <div class="absolute top-20 right-4 z-20 pointer-events-auto">
      <div class="p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-0.5">
        <button @click="navMode = 'orbit'" title="Orbital"
          class="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          :class="navMode === 'orbit' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'">
          <mdicon name="orbit-variant" size="18" />
        </button>
        <button @click="navMode = 'thirdPerson'" title="Caminar"
          class="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          :class="navMode === 'thirdPerson' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'">
          <mdicon name="walk" size="18" />
        </button>
        <button @click="navMode = 'fly'" title="Vuelo"
          class="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          :class="navMode === 'fly' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'">
          <mdicon name="airplane" size="18" />
        </button>
      </div>
    </div>

    <!-- Compact keyboard hints — desktop only -->
    <div v-if="(navMode === 'thirdPerson' || navMode === 'fly') && !isMobile" class="absolute bottom-4 right-4 z-10 hidden md:block">
      <div class="px-3 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-white/80 text-xs flex items-center gap-3">
        <span><kbd class="px-1 py-0.5 bg-white/10 rounded text-[10px]">WASD</kbd> mover</span>
        <span><mdicon name="mouse-outline" size="12" class="inline" /> mirar</span>
        <span><kbd class="px-1 py-0.5 bg-white/10 rounded text-[10px]">Q/E</kbd> ↕</span>
        <span v-if="navMode === 'thirdPerson'"><kbd class="px-1 py-0.5 bg-white/10 rounded text-[10px]">Space</kbd> saltar</span>
        <span class="text-white/40 italic">click para activar · Esc para salir</span>
      </div>
    </div>

    <!-- Mobile-only floating action buttons (jump + up/down) -->
    <div v-if="isMobile && (navMode === 'thirdPerson' || navMode === 'fly')"
      class="absolute bottom-6 right-6 z-20 flex flex-col gap-3 pointer-events-auto">
      <button
        @touchstart.prevent="keys.e = true"
        @touchend.prevent="keys.e = false"
        @touchcancel.prevent="keys.e = false"
        class="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:bg-purple-600 shadow-lg">
        <mdicon name="arrow-up-bold" size="22" />
      </button>
      <button
        @touchstart.prevent="keys.q = true"
        @touchend.prevent="keys.q = false"
        @touchcancel.prevent="keys.q = false"
        class="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:bg-purple-600 shadow-lg">
        <mdicon name="arrow-down-bold" size="22" />
      </button>
      <button v-if="navMode === 'thirdPerson'"
        @touchstart.prevent="jumpRequested = true"
        class="w-14 h-14 rounded-full bg-purple-600/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:bg-purple-500 shadow-lg">
        <mdicon name="arrow-collapse-up" size="22" />
      </button>
    </div>
  </div>
</template>
