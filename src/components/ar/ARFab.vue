<script setup>
defineProps({
  actions: { type: Array, default: () => [] },
});
const emit = defineEmits(['action']);

const handle = (action) => {
  if (action.disabled) return;
  emit('action', action.id);
};
</script>

<template>
  <div class="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[calc(100vw-16px)]">
    <div class="flex items-center gap-1 px-1.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-2xl overflow-x-auto no-scrollbar">
      <button
        v-for="action in actions"
        :key="action.id"
        @click="handle(action)"
        :disabled="action.disabled"
        :title="action.label"
        class="relative flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
        :class="action.active
          ? 'bg-purple-600 hover:bg-purple-500'
          : 'bg-white/10 hover:bg-white/20'"
      >
        <mdicon :name="action.icon" size="18" />
        <span v-if="action.badge" class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-amber-500 text-[9px] font-bold flex items-center justify-center">
          {{ action.badge }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
