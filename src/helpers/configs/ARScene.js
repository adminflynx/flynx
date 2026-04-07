import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { Lights } from "../Lights.js";
import { Axes } from "../Grids.js";

const createARWorld = (components, container) => {
  const worlds = components.get(OBC.Worlds);

  const world = worlds.create();

  world.scene = new OBC.SimpleScene(components);
  world.renderer = new OBC.SimpleRenderer(components, container);
  world.camera = new OBC.SimpleCamera(components);

  world.scene.setup();

  const lights = new Lights();
  const ax = new Axes(50, 50);

  world.scene.three.add(lights.ambient);
  world.scene.three.add(ax.axes);

  world.camera.controls.setLookAt(5, 1, 5, 0, 0, 0);

  return world;
};

export { createARWorld };
