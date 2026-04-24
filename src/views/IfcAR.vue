<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import * as THREE from 'three';
import * as OBC from '@thatopen/components';

import ARStatusBar from '../components/ar/ARStatusBar.vue';
import ARFab from '../components/ar/ARFab.vue';
import ARBottomSheet from '../components/ar/ARBottomSheet.vue';
import ARToast from '../components/ar/ARToast.vue';

import { createARHitTest } from '../helpers/ARHitTest.js';
import { createARAnchors } from '../helpers/ARAnchors.js';
import { createARGestures } from '../helpers/ARGestures.js';

// ── Reactive state ──
const viewerContainer = ref(null);
const status = ref('idle');
const modelName = ref('');
const toastMsg = ref('');
const toastType = ref('info');
const toastKey = ref(0);
const sheetOpen = ref(false);
const sheetView = ref('classes');
const isInXR = ref(false);
const placed = ref(false);
const loadedModels = ref([]);
const ifcClasses = ref([]);
const scaleFactor = ref(1);
const opacityValue = ref(1);
const clipValue = ref(2);
const clipMin = ref(0);
const clipMax = ref(10);
const clipEnabled = ref(false);

// Device support
const isIOS = ref(false);
const isXRSupported = ref(false);
const xrCheckDone = ref(false);
const isSecureContext = ref(true);

// Engine refs
let scene = null;
let camera = null;
let renderer = null;
let canvasEl = null;
let components = null;
let fragments = null;
let ifcLoader = null;
let classifier = null;
let arButtonEl = null;
let hitTest = null;
let anchors = null;
let gestures = null;
let currentARSession = null;
const clipPlanes = [];

// ── Toast helper ──
const showToast = (msg, type = 'info') => {
  toastMsg.value = msg;
  toastType.value = type;
  toastKey.value += 1;
};

// ── Device detection ──
const detectIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const detectXRSupport = async () => {
  if (!('xr' in navigator)) return false;
  try {
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch {
    return false;
  }
};

// ── FAB actions ──
const fabActions = computed(() => [
  { id: 'load', icon: 'upload', label: 'Cargar IFC' },
  { id: 'reset', icon: 'restore', label: 'Reset', disabled: !placed.value },
  { id: 'visibility', icon: 'eye-outline', label: 'Visibilidad', disabled: loadedModels.value.length === 0 },
  { id: 'classes', icon: 'shape-outline', label: 'Clases IFC', disabled: ifcClasses.value.length === 0 },
  { id: 'clipping', icon: 'crop', label: 'Crop', disabled: loadedModels.value.length === 0, active: clipEnabled.value },
  { id: 'options', icon: 'tune', label: 'Opciones', disabled: loadedModels.value.length === 0 },
]);

// ── File loading ──
const triggerFilePicker = () => {
  const input = document.getElementById('ar-file-input');
  if (input) input.click();
};

const loadIfcFile = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  status.value = 'loading';
  modelName.value = file.name;
  try {
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    await ifcLoader.load(data, true, file.name);
    status.value = isInXR.value ? 'searching' : 'ready';
    showToast(`${file.name} cargado`, 'success');
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
    status.value = 'idle';
  }
  event.target.value = '';
};

// ── Build IFC classes ──
const buildIfcClasses = async (retries = 5) => {
  if (!classifier || !fragments) return;
  try {
    await classifier.byCategory();
    const categories = classifier.list.get('Category');
    if (!categories) return;
    const result = [];
    for (const [groupName, groupData] of categories) {
      const modelIdMap = await groupData.get();
      let count = 0;
      for (const ids of Object.values(modelIdMap)) count += ids.size;
      result.push({ typeName: groupName, count, visible: true, modelIdMap });
    }
    ifcClasses.value = result;
  } catch (err) {
    if (retries > 0 && /Model not found/i.test(err?.message || '')) {
      setTimeout(() => buildIfcClasses(retries - 1), 400);
    }
  }
};

// ── Place / reset / visibility ──
const placeModel = async () => {
  if (!hitTest || !hitTest.isHitting()) {
    showToast('Apunta a una superficie', 'warning');
    return;
  }
  if (loadedModels.value.length === 0) {
    showToast('Carga un modelo primero', 'warning');
    return;
  }
  const hit = hitTest.getLastHit();
  for (const model of loadedModels.value) {
    await anchors.place(model.object, hit);
    model.object.visible = true;
  }
  placed.value = true;
  status.value = 'placed';
  showToast('Modelo colocado', 'success');
};

const resetPlacement = () => {
  anchors.clear();
  for (const model of loadedModels.value) {
    model.object.position.set(0, -100, 0);
  }
  placed.value = false;
  status.value = 'searching';
  showToast('Coloca de nuevo el modelo', 'info');
};

const toggleVisibility = () => {
  for (const model of loadedModels.value) {
    model.object.visible = !model.object.visible;
  }
};

// ── Transformations ──
const applyScale = (factor) => {
  scaleFactor.value = Math.max(0.05, Math.min(10, factor));
  for (const model of loadedModels.value) model.object.scale.setScalar(scaleFactor.value);
};

const applyRotation = (deltaRad) => {
  const axis = new THREE.Vector3(0, 1, 0);
  for (const model of loadedModels.value) model.object.rotateOnWorldAxis(axis, deltaRad);
};

const applyTranslation = (dx, dz) => {
  for (const model of loadedModels.value) {
    model.object.position.x += dx;
    model.object.position.z += dz;
  }
};

const applyOpacity = (value) => {
  opacityValue.value = value;
  for (const model of loadedModels.value) {
    model.object.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        for (const m of mats) {
          m.transparent = value < 1;
          m.opacity = value;
        }
      }
    });
  }
};

const toggleClassVisibility = (cls) => {
  cls.visible = !cls.visible;
  if (!fragments) return;
  for (const [modelId, ids] of Object.entries(cls.modelIdMap)) {
    const model = fragments.list.get(modelId);
    if (!model) continue;
    model.setVisible([...ids], cls.visible).then(() => fragments.core.update(true)).catch(() => {});
  }
};

// ── Clipping ──
const toggleClipping = () => {
  clipEnabled.value = !clipEnabled.value;
  if (!renderer) return;
  renderer.clippingPlanes = clipEnabled.value ? clipPlanes : [];
};

const updateClipPlane = (newVal) => {
  clipValue.value = newVal;
  if (clipPlanes[0]) clipPlanes[0].constant = newVal;
};

const setupClipping = () => {
  if (loadedModels.value.length === 0) return;
  const box = new THREE.Box3().setFromObject(loadedModels.value[0].object);
  clipMin.value = box.min.y;
  clipMax.value = box.max.y;
  clipValue.value = (box.min.y + box.max.y) / 2;
  const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), clipValue.value);
  clipPlanes.length = 0;
  clipPlanes.push(plane);
};

// ── FAB action handler ──
const onFabAction = (id) => {
  switch (id) {
    case 'load': triggerFilePicker(); break;
    case 'reset': resetPlacement(); break;
    case 'visibility': toggleVisibility(); break;
    case 'classes': sheetView.value = 'classes'; sheetOpen.value = true; break;
    case 'clipping':
      if (!clipEnabled.value && loadedModels.value.length) setupClipping();
      toggleClipping();
      break;
    case 'options': sheetView.value = 'scale'; sheetOpen.value = true; break;
  }
};

// ── AR session management ──

// Detect if Immersive Web Emulator is intercepting WebXR.
// The polyfill creates non-native XRSession objects that fail strict Web IDL
// type checks in XRWebGLBinding constructor. Source: three.js issue #31432.
const isEmulatorActive = () => {
  return typeof navigator !== 'undefined' &&
    navigator.xr &&
    navigator.xr.constructor?.name?.includes('Polyfill');
};

const startARSession = async () => {
  if (!isXRSupported.value) {
    showToast('AR no soportado en este dispositivo', 'error');
    return;
  }

  // Workaround for three.js r173+ + Immersive Web Emulator / experimental Chrome flags:
  // Hide XRWebGLBinding so three.js's WebXRManager skips the layers path and uses
  // the classic XRWebGLLayer baseLayer path. Restore after setSession completes.
  // See: https://github.com/mrdoob/three.js/issues/31432
  const savedBinding = window.XRWebGLBinding;
  const restoreBinding = () => {
    if (savedBinding) window.XRWebGLBinding = savedBinding;
  };

  try {
    // Ensure the WebGL context is XR-compatible right before requesting session
    const gl = renderer.getContext();
    const attrs = gl.getContextAttributes?.() || {};
    if (!attrs.xrCompatible && typeof gl.makeXRCompatible === 'function') {
      await gl.makeXRCompatible();
    }

    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay', 'anchors'],
      domOverlay: { root: document.body },
    });

    session.addEventListener('end', () => {
      currentARSession = null;
      isInXR.value = false;
      placed.value = false;
      status.value = loadedModels.value.length ? 'ready' : 'idle';
      if (arButtonEl) arButtonEl.textContent = 'INICIAR AR';
    });

    // Hide XRWebGLBinding from three.js so it uses the baseLayer path
    try { delete window.XRWebGLBinding; } catch (e) { window.XRWebGLBinding = undefined; }

    try {
      await renderer.xr.setSession(session);
    } finally {
      restoreBinding();
    }

    currentARSession = session;
    isInXR.value = true;
    if (loadedModels.value.length) status.value = 'searching';
    if (arButtonEl) arButtonEl.textContent = 'SALIR AR';
    showToast('Apunta a una superficie y toca para colocar', 'info');
  } catch (err) {
    restoreBinding();
    console.error('AR session error:', err);
    const hint = isEmulatorActive()
      ? ' (Immersive Web Emulator detectado — desactivalo para usar AR nativo)'
      : '';
    showToast(`Error AR: ${err.message}${hint}`, 'error');
  }
};

const stopARSession = async () => {
  if (currentARSession) {
    try { await currentARSession.end(); } catch (e) { /* noop */ }
  }
};

// ── Gestures ──
const setupGestures = () => {
  if (!viewerContainer.value) return;
  gestures = createARGestures(viewerContainer.value, {
    onTap: () => { if (isInXR.value) placeModel(); },
    onDoubleTap: () => { if (loadedModels.value.length) toggleVisibility(); },
    onLongPress: () => { if (placed.value) resetPlacement(); },
    onPan: ({ dx, dy, pointers }) => {
      if (pointers === 1 && placed.value) {
        const speed = 0.001 * scaleFactor.value;
        applyTranslation(dx * speed, dy * speed);
      }
    },
    onPinch: ({ scale }) => { if (placed.value) applyScale(scaleFactor.value * scale); },
    onRotate: ({ deltaDeg }) => { if (placed.value) applyRotation(THREE.MathUtils.degToRad(deltaDeg)); },
  });
};

// ── Mount ──
onMounted(async () => {
  // Device + XR detection
  isIOS.value = detectIOS();
  isSecureContext.value = window.isSecureContext;
  isXRSupported.value = await detectXRSupport();
  xrCheckDone.value = true;

  // Build VANILLA THREE renderer with xrCompatible context from the start
  canvasEl = document.createElement('canvas');
  canvasEl.style.position = 'absolute';
  canvasEl.style.top = '0';
  canvasEl.style.left = '0';
  canvasEl.style.width = '100%';
  canvasEl.style.height = '100%';
  viewerContainer.value.appendChild(canvasEl);

  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: true,
    alpha: true,
    depth: true,
    stencil: false,
    xrCompatible: true,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // transparent so AR camera passthrough shows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.localClippingEnabled = true;
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');

  scene = new THREE.Scene();
  scene.background = null; // transparent for AR
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(5, 1, 5);
  camera.lookAt(0, 0, 0);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(0, 10, 0);
  scene.add(dirLight);

  // OBC components — only what we need (no SimpleRenderer / SimpleCamera / SimpleScene)
  components = new OBC.Components();

  fragments = components.get(OBC.FragmentsManager);
  const workerUrl = 'https://thatopen.github.io/engine_fragment/resources/worker.mjs';
  const fetchedWorker = await fetch(workerUrl);
  const workerBlob = await fetchedWorker.blob();
  const workerFile = new File([workerBlob], 'worker.mjs', { type: 'text/javascript' });
  fragments.init(URL.createObjectURL(workerFile));

  fragments.list.onItemSet.add(({ value: model }) => {
    model.useCamera(camera);
    scene.add(model.object);
    fragments.core.update(true);
    loadedModels.value.push(model);
    setTimeout(() => buildIfcClasses(), 600);
  });

  ifcLoader = components.get(OBC.IfcLoader);
  await ifcLoader.setup({ autoSetWasm: false, wasm: { path: '/wasm/', absolute: true } });
  classifier = components.get(OBC.Classifier);

  // Custom AR button (only if XR is supported)
  if (isXRSupported.value) {
    arButtonEl = document.createElement('button');
    arButtonEl.id = 'ARButton';
    arButtonEl.textContent = 'INICIAR AR';
    Object.assign(arButtonEl.style, {
      position: 'fixed', bottom: '88px', right: '20px',
      padding: '12px 20px', borderRadius: '999px',
      background: 'linear-gradient(135deg, rgb(124,58,237), rgb(99,102,241))',
      color: '#fff', border: 'none',
      fontSize: '13px', fontWeight: '700', cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(124,58,237,0.4)',
      zIndex: '1000',
    });
    arButtonEl.onclick = () => {
      if (currentARSession) stopARSession();
      else startARSession();
    };
    document.body.appendChild(arButtonEl);
  }

  // AR helpers
  hitTest = createARHitTest({ renderer, scene });
  anchors = createARAnchors({ renderer });

  const bgContainer = document.getElementById('bgContainer');
  let prevBodyBg = '';
  let prevHtmlBg = '';
  renderer.xr.addEventListener('sessionstart', () => {
    bgContainer?.classList.add('bg-transparent');
    bgContainer?.classList.remove(
      'bg-gradient-to-t', 'from-blue-100', 'via-blue-100', 'to-blue-200',
      'dark:from-slate-900', 'dark:via-slate-600', 'dark:to-slate-900'
    );
    // Make sure body/html backgrounds don't block the camera feed
    prevBodyBg = document.body.style.background;
    prevHtmlBg = document.documentElement.style.background;
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    // Force renderer to use transparent clear during XR
    renderer.setClearColor(0x000000, 0);
  });
  renderer.xr.addEventListener('sessionend', () => {
    document.body.style.background = prevBodyBg;
    document.documentElement.style.background = prevHtmlBg;
  });

  // Resize handler
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  // Gestures
  setupGestures();

  // Animation loop — XR-aware
  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame) {
      hitTest?.update(frame);
      anchors?.update(frame);
    }
    fragments?.core.update();
    renderer.render(scene, camera);
  });

  components.init();
});

onBeforeUnmount(() => {
  if (currentARSession) {
    try { currentARSession.end(); } catch (e) { /* noop */ }
  }
  if (arButtonEl && arButtonEl.parentNode) arButtonEl.parentNode.removeChild(arButtonEl);
  if (gestures) gestures.dispose();
  if (hitTest) hitTest.dispose();
  if (anchors) anchors.clear();
  if (renderer) {
    renderer.setAnimationLoop(null);
    renderer.dispose();
  }
  if (canvasEl && canvasEl.parentNode) canvasEl.parentNode.removeChild(canvasEl);
  if (components) components.dispose();
});
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden">
    <!-- 3D Viewport (transparent in AR so camera passthrough shows) -->
    <div ref="viewerContainer" class="absolute inset-0 w-full h-full"
      :class="isInXR ? 'bg-transparent' : 'bg-slate-900'"></div>

    <!-- Hidden file input -->
    <input id="ar-file-input" type="file" accept=".ifc,.frag" class="hidden" @change="loadIfcFile" />

    <!-- iOS / unsupported warning -->
    <div v-if="xrCheckDone && !isXRSupported"
      class="absolute top-20 left-4 right-4 z-30 max-w-md mx-auto pointer-events-auto">
      <div class="p-4 rounded-2xl bg-amber-500/95 backdrop-blur-md text-white shadow-xl">
        <div class="flex items-start gap-3">
          <mdicon :name="isIOS ? 'apple-ios' : 'alert-circle-outline'" size="24" class="flex-shrink-0 mt-0.5" />
          <div class="text-sm">
            <p class="font-semibold mb-1">
              {{ isIOS ? 'AR no disponible en iOS' : 'WebXR no soportado' }}
            </p>
            <p class="text-white/90 text-xs leading-relaxed">
              <template v-if="isIOS">
                Chrome y Safari en iOS no soportan WebXR aún. Para usar el modo AR, abre este sitio desde
                <strong>Chrome en Android</strong> o desde un visor con soporte WebXR.
              </template>
              <template v-else-if="!isSecureContext">
                WebXR requiere HTTPS. Accede al sitio vía https://www.flynx.co
              </template>
              <template v-else>
                Tu navegador no soporta inmersive-ar. Prueba con Chrome o Edge en Android, o descarga la app desktop
                <router-link to="/territorial-twin" class="underline font-medium">TerritorialTwin</router-link>.
              </template>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Status bar (only inside XR session) -->
    <ARStatusBar v-if="isInXR" :status="status" :modelName="modelName" />

    <!-- FAB -->
    <ARFab :actions="fabActions" @action="onFabAction" />

    <!-- Toast -->
    <ARToast :key="toastKey" :message="toastMsg" :type="toastType" />

    <!-- Bottom sheet -->
    <ARBottomSheet v-model:open="sheetOpen" :title="sheetView === 'classes' ? 'Clases IFC' : 'Opciones'">
      <div v-if="sheetView === 'classes'" class="space-y-2">
        <div v-if="ifcClasses.length === 0" class="text-center py-8 text-white/50 text-sm">
          Carga un modelo para ver sus clases
        </div>
        <button v-for="cls in ifcClasses" :key="cls.typeName"
          @click="toggleClassVisibility(cls)"
          class="flex items-center justify-between w-full p-3 rounded-xl transition-all"
          :class="cls.visible ? 'bg-white/10 hover:bg-white/15' : 'bg-white/5 hover:bg-white/10 opacity-50'">
          <div class="flex items-center gap-3">
            <mdicon :name="cls.visible ? 'eye-outline' : 'eye-off-outline'" size="18" class="text-purple-400" />
            <span class="text-white text-sm font-medium">{{ cls.typeName }}</span>
          </div>
          <span class="text-white/50 text-xs">{{ cls.count }}</span>
        </button>
      </div>

      <div v-if="sheetView === 'scale'" class="space-y-6">
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-white text-sm font-medium">Escala</label>
            <span class="text-white/60 text-xs font-mono">{{ scaleFactor.toFixed(2) }}x</span>
          </div>
          <input type="range" min="0.05" max="5" step="0.05" :value="scaleFactor"
            @input="applyScale(parseFloat($event.target.value))"
            class="w-full accent-purple-500" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-white text-sm font-medium">Opacidad</label>
            <span class="text-white/60 text-xs font-mono">{{ Math.round(opacityValue * 100) }}%</span>
          </div>
          <input type="range" min="0.1" max="1" step="0.05" :value="opacityValue"
            @input="applyOpacity(parseFloat($event.target.value))"
            class="w-full accent-purple-500" />
        </div>

        <div v-if="clipEnabled">
          <div class="flex items-center justify-between mb-2">
            <label class="text-white text-sm font-medium">Plano de corte</label>
            <span class="text-white/60 text-xs font-mono">{{ clipValue.toFixed(2) }}m</span>
          </div>
          <input type="range" :min="clipMin" :max="clipMax" step="0.05" :value="clipValue"
            @input="updateClipPlane(parseFloat($event.target.value))"
            class="w-full accent-purple-500" />
        </div>

        <div class="pt-4 border-t border-white/10 text-xs text-white/50 space-y-2">
          <p class="flex items-center gap-2"><mdicon name="gesture-tap" size="14" /> Tap: Colocar modelo</p>
          <p class="flex items-center gap-2"><mdicon name="gesture-double-tap" size="14" /> Doble tap: Toggle visibilidad</p>
          <p class="flex items-center gap-2"><mdicon name="gesture-pinch" size="14" /> Pinch: Escalar</p>
          <p class="flex items-center gap-2"><mdicon name="rotate-3d-variant" size="14" /> Rotar 2 dedos: Rotar modelo</p>
          <p class="flex items-center gap-2"><mdicon name="cursor-move" size="14" /> Drag 1 dedo: Mover</p>
          <p class="flex items-center gap-2"><mdicon name="gesture-tap-hold" size="14" /> Long press: Reset</p>
        </div>
      </div>
    </ARBottomSheet>
  </div>
</template>
