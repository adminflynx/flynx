import * as OBC from "@thatopen/components";

let components = null;
let ifcLoader = null;
let fragments = null;

const initComponents = () => {
  if (components) return { components, ifcLoader, fragments };
  components = new OBC.Components();
  return { components, ifcLoader, fragments };
};

const setupIfcLoader = async (comps) => {
  ifcLoader = comps.get(OBC.IfcLoader);
  await ifcLoader.setup({ autoSetWasm: true });
  fragments = comps.get(OBC.FragmentsManager);
  return { ifcLoader, fragments };
};

const loadIfcFile = async (buffer, fileName = "model") => {
  if (!ifcLoader) throw new Error("IfcLoader not initialized. Call setupIfcLoader first.");
  const data = new Uint8Array(buffer);
  const model = await ifcLoader.load(data, true, fileName);
  return model;
};

const loadFragmentFile = async (buffer, modelId = "model") => {
  if (!fragments) throw new Error("FragmentsManager not initialized. Call setupIfcLoader first.");
  await fragments.load(buffer, { modelId });
};

const exportFragments = async () => {
  if (!fragments) return null;
  const [model] = fragments.list.values();
  if (!model) return null;
  const fragsBuffer = await model.getBuffer(false);
  return fragsBuffer;
};

const disposeComponents = () => {
  if (components) {
    components.dispose();
    components = null;
    ifcLoader = null;
    fragments = null;
  }
};

export {
  initComponents,
  setupIfcLoader,
  loadIfcFile,
  loadFragmentFile,
  exportFragments,
  disposeComponents,
};
