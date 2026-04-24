<script setup>
defineProps({
  status: { type: String, default: 'idle' },
  modelName: { type: String, default: '' },
});

const labels = {
  idle: 'Carga un modelo IFC',
  loading: 'Cargando modelo...',
  ready: 'Apunta a una superficie y toca',
  searching: 'Buscando superficie plana...',
  placed: 'Modelo colocado',
};

const icons = {
  idle: 'upload',
  loading: 'progress-clock',
  ready: 'gesture-tap',
  searching: 'magnify-scan',
  placed: 'check-circle-outline',
};
</script>

<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
    <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-sm shadow-lg">
      <mdicon :name="icons[status] || 'information-outline'" size="18" />
      <span>{{ labels[status] || status }}</span>
      <span v-if="modelName" class="text-white/60 text-xs ml-1 truncate max-w-[120px]">· {{ modelName }}</span>
    </div>
  </div>
</template>
