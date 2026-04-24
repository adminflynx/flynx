import * as THREE from "three";

/**
 * Sets up WebXR hit-test with a visual reticle that follows detected surfaces.
 * Detects whether the hit surface is horizontal (floor/table) or vertical
 * (wall) and orients the reticle accordingly.
 *
 * Returns helpers to manage hit-test source and read pose each frame.
 */
export function createARHitTest({ renderer, scene }) {
  // Reticle: a torus that orients itself to the detected surface normal
  const reticleGeometry = new THREE.RingGeometry(0.07, 0.1, 32).rotateX(-Math.PI / 2);
  const reticleMaterial = new THREE.MeshBasicMaterial({
    color: 0xbcf124,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;

  // Inner dot
  const dotGeometry = new THREE.CircleGeometry(0.03, 32).rotateX(-Math.PI / 2);
  const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
  const dot = new THREE.Mesh(dotGeometry, dotMaterial);
  reticle.add(dot);

  scene.add(reticle);

  let hitTestSource = null;
  let hitTestSourceRequested = false;
  let surfaceOrientation = 'horizontal'; // 'horizontal' | 'vertical' | 'unknown'

  const lastHit = {
    pose: null,
    matrix: new THREE.Matrix4(),
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    orientation: 'horizontal',
  };

  const onSessionEnd = () => {
    hitTestSource = null;
    hitTestSourceRequested = false;
    reticle.visible = false;
  };

  // Compute orientation from the pose's local up vector.
  // After fromArray + decompose, the y-axis basis vector (matrix elements 4,5,6)
  // tells us the surface normal direction in world space.
  const _yAxis = new THREE.Vector3();
  const computeOrientation = (matrix) => {
    _yAxis.set(matrix.elements[4], matrix.elements[5], matrix.elements[6]).normalize();
    const dot = Math.abs(_yAxis.y); // 1 = horizontal, 0 = vertical
    if (dot > 0.85) return 'horizontal';
    if (dot < 0.4) return 'vertical';
    return 'unknown';
  };

  const update = async (frame) => {
    const session = renderer.xr.getSession();
    if (!session || !frame) return;

    if (!hitTestSourceRequested) {
      hitTestSourceRequested = true;
      try {
        const refSpace = await session.requestReferenceSpace("viewer");
        // Try requesting hit-test that includes both planes and meshes (surfaces).
        // Falls back to default if the device doesn't support entityTypes.
        try {
          hitTestSource = await session.requestHitTestSource({
            space: refSpace,
            entityTypes: ['plane', 'mesh'],
          });
        } catch {
          hitTestSource = await session.requestHitTestSource({ space: refSpace });
        }
        session.addEventListener("end", onSessionEnd);
      } catch (err) {
        console.warn("Hit-test not supported:", err);
      }
    }

    if (!hitTestSource) return;

    const referenceSpace = renderer.xr.getReferenceSpace();
    const hitTestResults = frame.getHitTestResults(hitTestSource);

    if (hitTestResults.length > 0) {
      const pose = hitTestResults[0].getPose(referenceSpace);
      reticle.visible = true;
      reticle.matrix.fromArray(pose.transform.matrix);

      lastHit.pose = pose;
      lastHit.matrix.fromArray(pose.transform.matrix);
      lastHit.matrix.decompose(lastHit.position, lastHit.quaternion, new THREE.Vector3());

      const orientation = computeOrientation(lastHit.matrix);
      lastHit.orientation = orientation;

      // Recolor reticle by orientation: cyan for horizontal, magenta for wall
      if (orientation !== surfaceOrientation) {
        surfaceOrientation = orientation;
        if (orientation === 'vertical') {
          reticleMaterial.color.setHex(0xc026d3);
        } else {
          reticleMaterial.color.setHex(0xbcf124);
        }
      }
    } else {
      reticle.visible = false;
      lastHit.pose = null;
    }
  };

  const isHitting = () => reticle.visible;
  const getLastHit = () => (lastHit.pose ? lastHit : null);
  const getOrientation = () => surfaceOrientation;

  const dispose = () => {
    if (hitTestSource) {
      try { hitTestSource.cancel(); } catch (e) { /* noop */ }
      hitTestSource = null;
    }
    scene.remove(reticle);
    reticle.geometry.dispose();
    reticle.material.dispose();
    dot.geometry.dispose();
    dot.material.dispose();
  };

  return { reticle, update, isHitting, getLastHit, getOrientation, dispose };
}
