import * as THREE from "three";

/**
 * Sets up WebXR hit-test with a visual reticle that follows detected surfaces.
 * Returns helpers to manage hit-test source and read pose each frame.
 */
export function createARHitTest({ renderer, scene }) {
  // Reticle: a torus on the ground plane that shows where the user is pointing
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

  const lastHit = {
    pose: null,
    matrix: new THREE.Matrix4(),
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
  };

  const onSessionEnd = () => {
    hitTestSource = null;
    hitTestSourceRequested = false;
    reticle.visible = false;
  };

  /**
   * Call inside the animation loop with the current XRFrame.
   */
  const update = async (frame) => {
    const session = renderer.xr.getSession();
    if (!session || !frame) return;

    if (!hitTestSourceRequested) {
      hitTestSourceRequested = true;
      try {
        const refSpace = await session.requestReferenceSpace("viewer");
        hitTestSource = await session.requestHitTestSource({ space: refSpace });
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
    } else {
      reticle.visible = false;
      lastHit.pose = null;
    }
  };

  const isHitting = () => reticle.visible;
  const getLastHit = () => (lastHit.pose ? lastHit : null);

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

  return { reticle, update, isHitting, getLastHit, dispose };
}
