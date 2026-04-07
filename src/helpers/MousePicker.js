import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as THREE from "three";

const setupHighlighter = async (components, world) => {
  // Setup raycaster for this world
  components.get(OBC.Raycasters).get(world);

  // Setup highlighter
  const highlighter = components.get(OBF.Highlighter);
  highlighter.setup({
    world,
    selectMaterialDefinition: {
      color: new THREE.Color("#bcf124"),
      opacity: 0.8,
      transparent: true,
      renderedFaces: 0,
    },
    hoverMaterialDefinition: {
      color: new THREE.Color("#6528D7"),
      opacity: 0.5,
      transparent: true,
      renderedFaces: 0,
    },
  });

  return highlighter;
};

const setupSelectionEvents = (components, highlighter, outputId, outputDesc) => {
  const fragments = components.get(OBC.FragmentsManager);

  highlighter.events.select.onHighlight.add(async (modelIdMap) => {
    for (const [modelId, localIds] of Object.entries(modelIdMap)) {
      const model = fragments.list.get(modelId);
      if (!model) continue;
      const ids = [...localIds];
      if (outputId) {
        outputId.innerHTML = `ExpressID: ${ids[0] || "N/A"}`;
      }
      if (outputDesc) {
        outputDesc.innerHTML = `Model: ${modelId}`;
      }
    }
  });

  highlighter.events.select.onClear.add(() => {
    if (outputId) outputId.innerHTML = "_";
    if (outputDesc) outputDesc.innerHTML = "_";
  });
};

export { setupHighlighter, setupSelectionEvents };
