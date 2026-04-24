import * as THREE from 'three';

/**
 * Visualizes detected real-world planes (floor, walls, ceiling, tables) as
 * subtle wireframe outlines. Color-coded by orientation:
 *   horizontal (floor/ceiling/table) -> cyan
 *   vertical (wall) -> magenta
 *
 * Requires the 'plane-detection' optional feature on the AR session.
 */
export function createARPlanes({ renderer, scene }) {
  const planeMeshes = new Map(); // XRPlane -> { mesh, lastUpdated }
  const horizontalMaterial = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const horizontalEdgeMaterial = new THREE.LineBasicMaterial({
    color: 0x06b6d4, transparent: true, opacity: 0.7,
  });
  const verticalMaterial = new THREE.MeshBasicMaterial({
    color: 0xc026d3,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const verticalEdgeMaterial = new THREE.LineBasicMaterial({
    color: 0xc026d3, transparent: true, opacity: 0.6,
  });

  let visible = true;

  const buildPlaneMesh = (plane) => {
    const polygon = plane.polygon;
    if (!polygon || polygon.length < 3) return null;

    // Build a triangle fan from the polygon (centered at origin in plane space)
    const vertices = [];
    for (const p of polygon) vertices.push(p.x, p.y, p.z);
    const fanIndices = [];
    for (let i = 1; i < polygon.length - 1; i++) {
      fanIndices.push(0, i, i + 1);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(fanIndices);
    geom.computeVertexNormals();

    const isVertical = plane.orientation === 'vertical';
    const fillMat = isVertical ? verticalMaterial : horizontalMaterial;
    const edgeMat = isVertical ? verticalEdgeMaterial : horizontalEdgeMaterial;

    const fill = new THREE.Mesh(geom, fillMat);

    // Edge outline
    const edges = new THREE.EdgesGeometry(geom);
    const outline = new THREE.LineSegments(edges, edgeMat);

    const group = new THREE.Group();
    group.add(fill);
    group.add(outline);
    group.matrixAutoUpdate = false;
    group.visible = visible;
    return group;
  };

  const update = (frame) => {
    if (!frame || !frame.detectedPlanes) return;
    const refSpace = renderer.xr.getReferenceSpace();
    if (!refSpace) return;

    const seen = new Set();

    for (const plane of frame.detectedPlanes) {
      seen.add(plane);
      let entry = planeMeshes.get(plane);

      // Build mesh first time, or rebuild if updated
      if (!entry || entry.lastUpdated < plane.lastChangedTime) {
        if (entry) {
          scene.remove(entry.group);
          entry.group.traverse((c) => c.geometry?.dispose?.());
        }
        const group = buildPlaneMesh(plane);
        if (!group) continue;
        scene.add(group);
        entry = { group, lastUpdated: plane.lastChangedTime };
        planeMeshes.set(plane, entry);
      }

      // Update transform from plane space to world
      try {
        const pose = frame.getPose(plane.planeSpace, refSpace);
        if (pose) {
          entry.group.matrix.fromArray(pose.transform.matrix);
          entry.group.matrixWorldNeedsUpdate = true;
        }
      } catch (err) { /* plane no longer tracked */ }
    }

    // Remove planes no longer reported
    for (const [plane, entry] of planeMeshes.entries()) {
      if (!seen.has(plane)) {
        scene.remove(entry.group);
        entry.group.traverse((c) => c.geometry?.dispose?.());
        planeMeshes.delete(plane);
      }
    }
  };

  const setVisible = (v) => {
    visible = v;
    for (const entry of planeMeshes.values()) entry.group.visible = v;
  };

  const dispose = () => {
    for (const entry of planeMeshes.values()) {
      scene.remove(entry.group);
      entry.group.traverse((c) => c.geometry?.dispose?.());
    }
    planeMeshes.clear();
    horizontalMaterial.dispose();
    horizontalEdgeMaterial.dispose();
    verticalMaterial.dispose();
    verticalEdgeMaterial.dispose();
  };

  return { update, setVisible, dispose, count: () => planeMeshes.size };
}
