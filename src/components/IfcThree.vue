<script setup>
import { ref, onMounted } from 'vue';
import '@thatopen/ui';
import { tables } from '@thatopen/ui-obc';

const props = defineProps({
  components: {
    type: Object,
    required: true,
  },
});

const treeContainer = ref(null);
let spatialTree = null;

onMounted(async () => {
  if (!props.components) return;

  // Wait for bim-table custom element to be registered
  await customElements.whenDefined('bim-table');

  const [tree] = tables.spatialTree({ components: props.components, models: [] });
  tree.preserveStructureOnFilter = true;
  spatialTree = tree;
  treeContainer.value.appendChild(tree);
});

const onSearch = (e) => {
  if (spatialTree) {
    spatialTree.queryString = e.target.value;
  }
};
</script>

<template>
  <div class="w-fit max-w-sm max-h-96 overflow-auto text-xs bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2">
    <input
      type="text"
      @input="onSearch"
      placeholder="Search..."
      class="w-full mb-2 p-1 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
    <div ref="treeContainer"></div>
  </div>
</template>
