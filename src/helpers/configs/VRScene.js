import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { Lights } from "../Lights.js";
import { Axes } from "../Grids.js";

const createVRWorld = (components, container) => {
  const worlds = components.get(OBC.Worlds);

  const world = worlds.create();

  world.scene = new OBC.SimpleScene(components);
  world.renderer = new OBC.SimpleRenderer(components, container);
  world.camera = new OBC.SimpleCamera(components);

  world.scene.setup();

  const lights = new Lights();
  const ax = new Axes(50, 50);

  world.scene.three.add(lights.ambient);
  world.scene.three.add(ax.grid);
  world.scene.three.add(ax.axes);

  world.camera.controls.setLookAt(0, 1.6, 10, 0, 0, 0);

  return world;
};

export { createVRWorld };
