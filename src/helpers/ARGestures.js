import Hammer from "hammerjs";

/**
 * Wraps Hammer.js to detect AR gestures on a DOM element.
 * Callbacks: onTap, onDoubleTap, onLongPress, onPan, onPinch, onRotate.
 *
 * Each callback receives a payload normalized to scene-friendly values.
 */
export function createARGestures(element, callbacks = {}) {
  if (!element) throw new Error("ARGestures: element is required");

  const hammer = new Hammer.Manager(element, { touchAction: "none" });

  // Recognizers
  const singleTap = new Hammer.Tap({ event: "singletap" });
  const doubleTap = new Hammer.Tap({ event: "doubletap", taps: 2 });
  const longPress = new Hammer.Press({ event: "press", time: 600 });
  const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 8 });
  const pinch = new Hammer.Pinch({ threshold: 0.05 });
  const rotate = new Hammer.Rotate({ threshold: 5 });

  // Allow pinch and rotate together
  pinch.recognizeWith(rotate);
  // Single tap fires only when not a double tap
  doubleTap.recognizeWith(singleTap);
  singleTap.requireFailure(doubleTap);

  hammer.add([doubleTap, singleTap, longPress, pan, pinch, rotate]);

  // ── Tap ──
  if (callbacks.onTap) {
    hammer.on("singletap", (ev) => {
      callbacks.onTap({ x: ev.center.x, y: ev.center.y, originalEvent: ev.srcEvent });
    });
  }

  if (callbacks.onDoubleTap) {
    hammer.on("doubletap", (ev) => {
      callbacks.onDoubleTap({ x: ev.center.x, y: ev.center.y });
    });
  }

  if (callbacks.onLongPress) {
    hammer.on("press", (ev) => {
      callbacks.onLongPress({ x: ev.center.x, y: ev.center.y });
    });
  }

  // ── Pan (drag) ──
  if (callbacks.onPan) {
    let lastDeltaX = 0;
    let lastDeltaY = 0;
    hammer.on("panstart", () => {
      lastDeltaX = 0;
      lastDeltaY = 0;
    });
    hammer.on("panmove", (ev) => {
      const dx = ev.deltaX - lastDeltaX;
      const dy = ev.deltaY - lastDeltaY;
      lastDeltaX = ev.deltaX;
      lastDeltaY = ev.deltaY;
      callbacks.onPan({ dx, dy, totalX: ev.deltaX, totalY: ev.deltaY, pointers: ev.pointers.length });
    });
  }

  // ── Pinch (scale) ──
  if (callbacks.onPinch) {
    let lastScale = 1;
    hammer.on("pinchstart", () => { lastScale = 1; });
    hammer.on("pinchmove", (ev) => {
      const delta = ev.scale / lastScale;
      lastScale = ev.scale;
      callbacks.onPinch({ scale: delta, totalScale: ev.scale });
    });
  }

  // ── Rotate ──
  if (callbacks.onRotate) {
    let lastRotation = 0;
    hammer.on("rotatestart", (ev) => { lastRotation = ev.rotation; });
    hammer.on("rotatemove", (ev) => {
      const delta = ev.rotation - lastRotation;
      lastRotation = ev.rotation;
      callbacks.onRotate({ deltaDeg: delta, totalDeg: ev.rotation });
    });
  }

  const dispose = () => {
    hammer.destroy();
  };

  return { dispose };
}
