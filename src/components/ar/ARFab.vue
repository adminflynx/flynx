<script setup>
defineProps({
  actions: { type: Array, default: () => [] },
  // each action: { id, icon, label, color?, disabled? }
});
const emit = defineEmits(['action']);

const handle = (action) => {
  if (action.disabled) return;
  emit('action', action.id);
};
</script>

<template>
  <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
    <div class="flex items-center gap-2 px-2 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-2xl">
      <button
        v-for="action in actions"
        :key="action.id"
        @click="handle(action)"
        :disabled="action.disabled"
        :title="action.label"
        class="relative w-12 h-12 rounded-full flex items-center justify-center text-white transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
        :class="action.active
          ? 'bg-purple-600 hover:bg-purple-500'
          : 'bg-white/10 hover:bg-white/20'"
      >
        <mdicon :name="action.icon" size="22" />
        <span v-if="action.badge" class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-[10px] font-bold flex items-center justify-center">
          {{ action.badge }}
        </span>
      </button>
    </div>
  </div>
</template>
