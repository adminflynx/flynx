import * as THREE from "three";

/**
 * Manages WebXR anchors so placed objects stay locked to the world even when
 * the device moves or pose tracking refines. Falls back to a static matrix
 * if the browser does not support the WebXR Anchors API.
 */
export function createARAnchors({ renderer }) {
  const anchors = new Map(); // key: object.uuid, value: { object, anchor, basePos, baseQuat }

  /**
   * Anchors `object` to the given hit-test pose.
   */
  const place = async (object, hit) => {
    if (!object || !hit) return;
    const session = renderer.xr.getSession();

    // Place the object at the hit pose immediately
    object.position.copy(hit.position);
    object.quaternion.copy(hit.quaternion);
    object.updateMatrixWorld(true);

    // Try to create a real WebXR anchor for stability across device movement
    if (session && hit.pose && typeof hit.pose.createAnchor === "function") {
      try {
        const anchor = await hit.pose.createAnchor();
        anchors.set(object.uuid, {
          object,
          anchor,
          basePos: hit.position.clone(),
          baseQuat: hit.quaternion.clone(),
        });
        return;
      } catch (err) {
        console.warn("Failed to create XR anchor, using static placement:", err);
      }
    }
    // Fallback: just remember the static placement
    anchors.set(object.uuid, {
      object,
      anchor: null,
      basePos: hit.position.clone(),
      baseQuat: hit.quaternion.clone(),
    });
  };

  /**
   * Each frame, sync object positions with their anchors.
   */
  const update = (frame) => {
    if (!frame) return;
    const referenceSpace = renderer.xr.getReferenceSpace();
    if (!referenceSpace) return;

    for (const entry of anchors.values()) {
      if (!entry.anchor) continue;
      try {
        const anchorPose = frame.getPose(entry.anchor.anchorSpace, referenceSpace);
        if (anchorPose) {
          // Preserve the user's transformations (scale, additional rotation)
          // applied after placement.
          const pos = new THREE.Vector3();
          const quat = new THREE.Quaternion();
          const m = new THREE.Matrix4().fromArray(anchorPose.transform.matrix);
          m.decompose(pos, quat, new THREE.Vector3());

          // Compute delta between the object's current transform and the
          // original placement, then apply that delta on top of the anchor.
          const offsetPos = new THREE.Vector3().subVectors(entry.object.position, entry.basePos);
          const offsetQuat = new THREE.Quaternion().multiplyQuaternions(
            entry.object.quaternion,
            entry.baseQuat.clone().invert()
          );

          entry.object.position.copy(pos).add(offsetPos);
          entry.object.quaternion.multiplyQuaternions(quat, offsetQuat);
        }
      } catch (err) {
        // Anchor may have been removed by the runtime
      }
    }
  };

  const remove = (object) => {
    const entry = anchors.get(object.uuid);
    if (entry?.anchor) {
      try { entry.anchor.delete(); } catch (e) { /* noop */ }
    }
    anchors.delete(object.uuid);
  };

  const clear = () => {
    for (const entry of anchors.values()) {
      if (entry.anchor) {
        try { entry.anchor.delete(); } catch (e) { /* noop */ }
      }
    }
    anchors.clear();
  };

  return { place, update, remove, clear };
}
