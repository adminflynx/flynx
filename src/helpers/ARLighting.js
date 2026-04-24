import { XREstimatedLight } from 'three/examples/jsm/webxr/XREstimatedLight.js';

/**
 * Wraps three.js XREstimatedLight so the AR scene reacts to real-world lighting:
 * - ambient spherical harmonics
 * - main directional light (sun / room light)
 * - environment cubemap for PBR reflections
 *
 * Falls back transparently to the provided default lights if the device/browser
 * does not support light-estimation.
 */
export function createARLighting({ renderer, scene, defaultLights = [] }) {
  const xrLight = new XREstimatedLight(renderer);

  let active = false;
  let savedEnvironment = null;

  const onEstimationStart = () => {
    active = true;
    scene.add(xrLight);

    // Hide default lights — we now use the real-world ones.
    for (const light of defaultLights) {
      light.userData._prevIntensity = light.intensity;
      light.intensity = 0;
    }

    // Use the estimated environment cubemap for PBR reflections
    if (xrLight.environment) {
      savedEnvironment = scene.environment;
      scene.environment = xrLight.environment;
    }
  };

  const onEstimationEnd = () => {
    active = false;
    scene.remove(xrLight);

    // Restore default lights
    for (const light of defaultLights) {
      if (light.userData._prevIntensity !== undefined) {
        light.intensity = light.userData._prevIntensity;
      }
    }

    if (savedEnvironment !== null) {
      scene.environment = savedEnvironment;
      savedEnvironment = null;
    } else {
      scene.environment = null;
    }
  };

  xrLight.addEventListener('estimationstart', onEstimationStart);
  xrLight.addEventListener('estimationend', onEstimationEnd);

  const dispose = () => {
    xrLight.removeEventListener('estimationstart', onEstimationStart);
    xrLight.removeEventListener('estimationend', onEstimationEnd);
    if (active) onEstimationEnd();
  };

  return { xrLight, dispose, isActive: () => active };
}
