import * as THREE from 'three';

/**
 * Generates a procedural grass-like canvas texture with subtle noise variation.
 */
const buildGrassTexture = (size = 512) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base gradient — slightly darker toward edges
  const gradient = ctx.createRadialGradient(size / 2, size / 2, size / 6, size / 2, size / 2, size / 1.2);
  gradient.addColorStop(0, '#4d8b3c');
  gradient.addColorStop(1, '#3a6b2c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Speckled noise — small "blades"
  const img = ctx.getImageData(0, 0, size, size);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 35;
    // Bias green channel for grass feel
    data[i] = Math.max(0, Math.min(255, data[i] + n * 0.4));      // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));    // G stronger
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n * 0.3)); // B
  }
  ctx.putImageData(img, 0, 0);

  // Larger blade strokes — random short lines
  const colors = ['#5fa54a', '#3d7530', '#6cb24e', '#2e5a23'];
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 2 + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;
    ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.lineWidth = 0.6 + Math.random() * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

/**
 * Creates a flat procedural grass terrain centered at the given XZ position.
 * Returns a THREE.Mesh on the Y=0 plane (or `centerY`).
 */
export function createGrassTerrain({ size = 200, centerX = 0, centerY = 0, centerZ = 0, repeat = 40 } = {}) {
  const texture = buildGrassTexture(512);
  texture.repeat.set(repeat, repeat);

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.95,
    metalness: 0,
    color: 0xffffff,
  });

  const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(centerX, centerY, centerZ);
  mesh.receiveShadow = true;
  mesh.name = 'grass-terrain';
  return mesh;
}
