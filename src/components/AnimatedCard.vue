<script setup>
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  variant: { type: String, default: 'purple' },
});

const gradients = {
  purple: 'linear-gradient(45deg, rgba(128, 0, 128, 0.7), rgba(255, 0, 255, 0.4), rgba(255, 255, 255, 0))',
  blue: 'linear-gradient(45deg, rgba(0, 109, 164, 0.66), rgba(47, 180, 246, 0.48), rgba(222, 157, 248, 0.24))',
  green: 'linear-gradient(45deg, rgba(0, 124, 128, 0.7), rgba(0, 255, 229, 0.4), rgba(177, 248, 248, 0.35))',
};
</script>

<template>
  <div class="flex justify-center items-center bg-transparent w-full">
    <div class="animated-card-gloss md:w-4/5 xl:w-3/5">
      <div
        class="animated-card-bg w-full h-full text-white rounded-lg"
        :style="{ background: gradients[variant] }"
      >
        <h1 v-if="title" class="text-xl font-bold mb-2">{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animated-card-bg {
  backdrop-filter: blur(10px);
  position: relative;
  padding: 2rem;
  border-radius: 20px;
  overflow: hidden;
  animation: flicker 3s infinite alternate;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.4);
}

@keyframes flicker {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
  100% { filter: brightness(1); }
}

.animated-card-gloss {
  border: 10px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background-clip: padding-box;
  position: relative;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.4);
}

.animated-card-gloss::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent 70%);
  transform: rotate(45deg);
  opacity: 0.2;
  pointer-events: none;
}
</style>
