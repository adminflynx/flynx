<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'info' }, // info, success, warning, error
  duration: { type: Number, default: 2200 },
});

const visible = ref(false);
let timer = null;

watch(() => props.message, (msg) => {
  if (!msg) return;
  visible.value = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { visible.value = false; }, props.duration);
});

const colors = {
  info: 'bg-blue-500/90',
  success: 'bg-green-500/90',
  warning: 'bg-amber-500/90',
  error: 'bg-red-500/90',
};

const icons = {
  info: 'information-outline',
  success: 'check-circle-outline',
  warning: 'alert-outline',
  error: 'alert-circle-outline',
};
</script>

<template>
  <transition
    enter-active-class="transition transform duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition transform duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div v-if="visible" class="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <div class="flex items-center gap-2 px-4 py-3 rounded-2xl text-white text-sm shadow-2xl backdrop-blur-md max-w-xs"
        :class="colors[type] || colors.info">
        <mdicon :name="icons[type] || 'information-outline'" size="18" />
        <span>{{ message }}</span>
      </div>
    </div>
  </transition>
</template>
