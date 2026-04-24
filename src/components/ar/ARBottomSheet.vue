<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
});
const emit = defineEmits(['update:open', 'close']);

const dragY = ref(0);
const dragging = ref(false);
let startY = 0;

const close = () => {
  emit('update:open', false);
  emit('close');
};

const onPointerDown = (e) => {
  dragging.value = true;
  startY = e.clientY;
};

const onPointerMove = (e) => {
  if (!dragging.value) return;
  const dy = e.clientY - startY;
  if (dy > 0) dragY.value = dy;
};

const onPointerUp = () => {
  if (!dragging.value) return;
  dragging.value = false;
  if (dragY.value > 80) {
    close();
  }
  dragY.value = 0;
};

watch(() => props.open, (val) => {
  if (val) dragY.value = 0;
});
</script>

<template>
  <!-- Backdrop -->
  <transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="open" @click="close" class="fixed inset-0 bg-black/40 z-40"></div>
  </transition>

  <!-- Sheet -->
  <transition
    enter-active-class="transition transform duration-300 ease-out"
    enter-from-class="translate-y-full"
    enter-to-class="translate-y-0"
    leave-active-class="transition transform duration-200 ease-in"
    leave-from-class="translate-y-0"
    leave-to-class="translate-y-full"
  >
    <div v-if="open"
      class="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl shadow-2xl"
      :style="{ transform: `translateY(${dragY}px)`, transition: dragging ? 'none' : '' }">

      <!-- Drag handle -->
      <div
        class="flex justify-center py-3 touch-none cursor-grab active:cursor-grabbing"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <div class="w-12 h-1.5 rounded-full bg-white/30"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between px-6 pb-3">
        <h3 class="text-white font-semibold">{{ title }}</h3>
        <button @click="close" class="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10">
          <mdicon name="close" size="18" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 pb-8 max-h-[60vh] overflow-y-auto">
        <slot />
      </div>
    </div>
  </transition>
</template>
