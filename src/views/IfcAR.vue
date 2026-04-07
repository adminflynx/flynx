<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import * as OBC from '@thatopen/components';
import LoadIfcButton from '../components/LoadIfcButton.vue';
import ARTools from '../components/ARTools.vue';
import Counter from '../components/basics/Counter.vue';
import CallbackBtn from '../components/basics/ARCallbackButton.vue';
import IfcClassAR from '../components/IfcClassAR.vue';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

const viewerContainer = ref(null);
const scaleFactor = ref(0.5);
const xPos = ref(0);
const yPos = ref(0);
const zPos = ref(0);
const rangeMin = ref(0);
const rangeMax = ref(10);
const rangeValue = ref(5);
const isTypeOpen = ref(false);
const isCropOpen = ref(false);

let components = null;
let world = null;
let fragments = null;
let ifcLoader = null;
let renderer = null;

const openType = () => isTypeOpen.value = !isTypeOpen.value;
const openCrop = () => isCropOpen.value = !isCropOpen.value;

const xdec = () => { xPos.value = Number((xPos.value - 0.1).toFixed(2)); };
const xinc = () => { xPos.value = Number((xPos.value + 0.1).toFixed(2)); };
const ydec = () => { yPos.value = Number((yPos.value - 0.1).toFixed(2)); };
const yinc = () => { yPos.value = Number((yPos.value + 0.1).toFixed(2)); };
const zdec = () => { zPos.value = Number((zPos.value - 0.1).toFixed(2)); };
const zinc = () => { zPos.value = Number((zPos.value + 0.1).toFixed(2)); };

const loadedModels = ref([]);
const ifcClasses = ref([]);
const clipPlanes = [];

const loadIfcFile = async (change) => {
  const file = change.target.files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  await ifcLoader.load(data, true, file.name);
};

const loadFragFile = async (change) => {
  const file = change.target.files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  await fragments.load(buffer, { modelId: file.name });
};

const makeScale = () => {
  const scaleVec = new THREE.Vector3(scaleFactor.value, scaleFactor.value, scaleFactor.value);
  loadedModels.value.forEach((model) => {
    model.object.scale.copy(scaleVec);
  });
};

const changePos = () => {
  const newPos = new THREE.Vector3(xPos.value, yPos.value, zPos.value);
  loadedModels.value.forEach((model) => {
    model.object.position.copy(newPos);
  });
};

const rotateLeft = () => {
  const axis = new THREE.Vector3(0, 1, 0);
  loadedModels.value.forEach((model) => {
    model.object.rotateOnWorldAxis(axis, Math.PI / 32);
  });
};

const rotateRight = () => {
  const axis = new THREE.Vector3(0, 1, 0);
  loadedModels.value.forEach((model) => {
    model.object.rotateOnWorldAxis(axis, -Math.PI / 32);
  });
};

const highLightType = (category) => {
  console.log("Highlight:", category);
};

const visibilizeTypes = (category) => {
  loadedModels.value.forEach((model) => {
    model.object.visible = !model.object.visible;
  });
};

const makeTypesTransparent = (category) => {
  loadedModels.value.forEach((model) => {
    model.object.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = Array.isArray(child.material) ? child.material : [child.material];
        mat.forEach((m) => {
          m.transparent = !m.transparent;
          m.opacity = m.transparent ? 0.2 : 1.0;
        });
      }
    });
  });
};

watch(rangeValue, (newVal) => {
  if (clipPlanes.length > 0) {
    clipPlanes[0].constant = newVal;
  }
});

const turnClipping = () => {
  openCrop();
  if (!renderer) return;
  if (renderer.clippingPlanes.length > 0) {
    renderer.clippingPlanes = [];
  } else {
    renderer.clippingPlanes = clipPlanes;
  }
};

onMounted(async () => {
  components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);

  world = worlds.create();
  world.scene = new OBC.SimpleScene(components);
  world.renderer = new OBC.SimpleRenderer(components, viewerContainer.value);
  world.camera = new OBC.SimpleCamera(components);

  world.scene.setup();
  world.camera.controls.setLookAt(5, 1, 5, 0, 0, 0);

  renderer = world.renderer.three;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.localClippingEnabled = true;

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
    loadedModels.value.push(model);
  });

  // Setup IFC loader
  ifcLoader = components.get(OBC.IfcLoader);
  await ifcLoader.setup({ autoSetWasm: false, wasm: { path: "/wasm/", absolute: true } });

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.8);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 10, 0);
  world.scene.three.add(ambientLight);
  world.scene.three.add(hemisphereLight);
  world.scene.three.add(directionalLight);

  // AR setup
  renderer.xr.enabled = true;
  const arButton = ARButton.createButton(renderer, {
    requiredFeatures: ['hit-test'],
    optionalFeatures: ['dom-overlay'],
    domOverlay: { root: document.body },
  });
  document.body.appendChild(arButton);

  const bgContainer = document.getElementById('bgContainer');
  renderer.xr.addEventListener('sessionstart', () => {
    bgContainer.classList.remove('bg-gradient-to-t', 'from-blue-100', 'via-blue-100',
      'to-blue-200', 'dark:from-slate-900', 'dark:via-slate-600', 'dark:to-slate-900');
    bgContainer.classList.add("bg-transparent");
  });

  components.init();
});

onBeforeUnmount(() => {
  const arBtn = document.getElementById('ARButton');
  if (arBtn) document.body.removeChild(arBtn);
  if (components) components.dispose();
});
</script>

<template>
  <div class="relative w-full h-screen">
    <div ref="viewerContainer" class="absolute inset-0 w-full h-full"></div>
    <div class="absolute top-0 left-0 right-0 z-10 pl-5 pr-5 pt-12 pointer-events-none">
      <div class="pointer-events-auto">
        <ARTools @rotateLeft="rotateLeft" @rotateRight="rotateRight" @showTypes="openType" @activeCrop="turnClipping"
          v-model:scale="scaleFactor">
          <template v-slot:scaleBtn>
            <CallbackBtn someClass="rounded-r-full" icon-name="resize" @function="makeScale" />
          </template>
          <template v-slot:ARTools>
            <div class="border-t-2 border-sky-600 mt-3 pt-3">
              <label>Displacement</label>
              <div class="flex">
                <Counter @increment="xinc" @decrement="xdec" label-name="x" :counter-value="xPos" />
                <Counter @increment="yinc" @decrement="ydec" label-name="y" :counter-value="yPos" />
                <Counter @increment="zinc" @decrement="zdec" label-name="z" :counter-value="zPos" />
              </div>
              <CallbackBtn someClass="rounded-full" class="mt-2" text="Move model" icon-name="axis-arrow"
                @function="changePos" />
            </div>
          </template>
        </ARTools>
      </div>
      <div class="pointer-events-auto">
        <LoadIfcButton :loadFunction="loadIfcFile" />
      </div>
      <div class="pointer-events-auto" v-if="isTypeOpen">
        <IfcClassAR @ifcClass="highLightType" @on-off="visibilizeTypes" @turnOpacity="makeTypesTransparent"
          :ifc-classes="ifcClasses" />
      </div>
      <div v-if="isCropOpen" class="w-1/5 h-3/4 fixed left-14 top-24 bg-transparent pointer-events-auto">
        <label for="default-range" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Crop plane</label>
        <div class="w-fit -rotate-90 fixed -left-10 top-60">
          <input id="default-range" type="range" :min="rangeMin" :max="rangeMax" v-model="rangeValue" step="0.1"
            class="w-60 h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-indigo-800 to-indigo-300">
        </div>
      </div>
    </div>
  </div>
</template>
