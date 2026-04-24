import * as THREE from 'three';

/**
 * Real-world occlusion via WebXR Depth Sensing.
 *
 * Each frame, the device provides a depth texture representing how far each
 * pixel of the camera image is from the device. We inject a fragment shader
 * snippet into every mesh material in the scene that compares the rendered
 * fragment's depth against the real-world depth — if the fragment is BEHIND
 * a real object, we discard it. This produces true occlusion: real walls,
 * furniture, etc. hide virtual BIM elements.
 *
 * Requires the 'depth-sensing' optional feature on the AR session, with
 * usagePreference: ['gpu-optimized'] and dataFormatPreference: ['luminance-alpha'].
 *
 * Reference: https://www.w3.org/TR/webxr-depth-sensing-1/
 *            https://github.com/tentone/enva-xr (technique)
 */
export function createAROcclusion({ renderer, scene }) {
  const patchedMaterials = new WeakSet();

  // Shared uniforms updated each frame
  const uniforms = {
    uDepthTexture: { value: null },
    uUvTransform: { value: new THREE.Matrix4() },
    uRawValueToMeters: { value: 0.001 },
    uOcclusionEnabled: { value: 0 }, // 0 = off, 1 = on
    uScreenSize: { value: new THREE.Vector2(1, 1) },
  };

  const occlusionVertexHeader = `
    varying vec3 vWorldPos;
  `;
  const occlusionVertexBody = `
    vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
  `;

  const occlusionFragmentHeader = `
    uniform sampler2D uDepthTexture;
    uniform mat4 uUvTransform;
    uniform float uRawValueToMeters;
    uniform float uOcclusionEnabled;
    uniform vec2 uScreenSize;
    varying vec3 vWorldPos;

    float getRealDepthMeters(vec2 ndc) {
      vec2 screenUV = ndc * 0.5 + 0.5;
      // Transform UV per WebXR depth texture conventions
      vec2 depthUV = (uUvTransform * vec4(screenUV, 0.0, 1.0)).xy;
      // luminance-alpha: low byte in r, high byte in a, combine to 16-bit value
      vec2 packedDepth = texture2D(uDepthTexture, depthUV).rg;
      float rawDepth = dot(packedDepth, vec2(255.0, 255.0 * 256.0));
      return rawDepth * uRawValueToMeters;
    }
  `;
  const occlusionFragmentBody = `
    if (uOcclusionEnabled > 0.5) {
      vec4 clipPos = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
      vec3 ndc = clipPos.xyz / clipPos.w;
      float realDepth = getRealDepthMeters(ndc.xy);
      // Distance from camera to this fragment (in meters, view space)
      float fragDepth = -(viewMatrix * vec4(vWorldPos, 1.0)).z;
      // If real-world is closer than the virtual fragment, discard
      if (realDepth > 0.0 && realDepth < fragDepth - 0.05) discard;
    }
  `;

  const patchMaterial = (material) => {
    if (!material || patchedMaterials.has(material)) return;
    patchedMaterials.add(material);

    const originalOnBeforeCompile = material.onBeforeCompile;
    material.onBeforeCompile = (shader) => {
      if (originalOnBeforeCompile) originalOnBeforeCompile(shader);

      // Inject vertex
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>\n${occlusionVertexHeader}`
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        `#include <project_vertex>\n${occlusionVertexBody}`
      );

      // Inject fragment
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>\n${occlusionFragmentHeader}`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <output_fragment>',
        `${occlusionFragmentBody}\n#include <output_fragment>`
      );

      // Bind uniforms
      shader.uniforms.uDepthTexture = uniforms.uDepthTexture;
      shader.uniforms.uUvTransform = uniforms.uUvTransform;
      shader.uniforms.uRawValueToMeters = uniforms.uRawValueToMeters;
      shader.uniforms.uOcclusionEnabled = uniforms.uOcclusionEnabled;
      shader.uniforms.uScreenSize = uniforms.uScreenSize;
    };
    material.needsUpdate = true;
  };

  const patchSceneMaterials = (root) => {
    root.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(patchMaterial);
      }
    });
  };

  let depthTexture = null;

  const update = (frame, camera) => {
    if (!frame || !renderer.xr.isPresenting) {
      uniforms.uOcclusionEnabled.value = 0;
      return;
    }
    const refSpace = renderer.xr.getReferenceSpace();
    if (!refSpace) return;
    const pose = frame.getViewerPose(refSpace);
    if (!pose) return;

    const view = pose.views[0];
    if (!view) return;

    let depthInfo = null;
    try {
      depthInfo = frame.getDepthInformation?.(view);
    } catch (err) {
      uniforms.uOcclusionEnabled.value = 0;
      return;
    }
    if (!depthInfo) {
      uniforms.uOcclusionEnabled.value = 0;
      return;
    }

    // Bind depth texture (GPU-optimized path)
    if (depthInfo.texture) {
      if (!depthTexture) {
        depthTexture = new THREE.Texture();
        depthTexture.minFilter = THREE.NearestFilter;
        depthTexture.magFilter = THREE.NearestFilter;
        depthTexture.wrapS = THREE.ClampToEdgeWrapping;
        depthTexture.wrapT = THREE.ClampToEdgeWrapping;
      }
      // Hand-off raw GL texture to three.js
      const props = renderer.properties.get(depthTexture);
      props.__webglTexture = depthInfo.texture;
      depthTexture.needsUpdate = false;
      uniforms.uDepthTexture.value = depthTexture;
    } else {
      uniforms.uOcclusionEnabled.value = 0;
      return;
    }

    if (depthInfo.normDepthBufferFromNormView?.matrix) {
      uniforms.uUvTransform.value.fromArray(depthInfo.normDepthBufferFromNormView.matrix);
    }
    uniforms.uRawValueToMeters.value = depthInfo.rawValueToMeters || 0.001;
    uniforms.uOcclusionEnabled.value = 1;
  };

  const setEnabled = (enabled) => {
    // When disabled, leave materials patched but the shader uniform skips occlusion.
    if (!enabled) uniforms.uOcclusionEnabled.value = 0;
  };

  return {
    patchSceneMaterials,
    patchMaterial,
    update,
    setEnabled,
    isSupported: () => uniforms.uOcclusionEnabled.value > 0,
  };
}
