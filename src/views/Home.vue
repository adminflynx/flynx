<script setup>
import { ref, onMounted } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import AnimatedCard from '../components/AnimatedCard.vue';
import { services } from '../data/services.js';

const statsRef = ref(null);
const statsVisible = ref(false);
const counters = ref([
  { value: 0, target: 8, label: 'Proyectos', suffix: '+' },
  { value: 0, target: 200, label: 'Profesionales Formados', suffix: '+' },
  { value: 0, target: 3, label: 'Alianzas Academicas', suffix: '' },
  { value: 0, target: 5, label: 'Comunidades Impactadas', suffix: '+' },
]);

onMounted(() => {
  useIntersectionObserver(statsRef, ([{ isIntersecting }]) => {
    if (isIntersecting && !statsVisible.value) {
      statsVisible.value = true;
      animateCounters();
    }
  });
});

const animateCounters = () => {
  counters.value.forEach((counter) => {
    const duration = 2000;
    const steps = 60;
    const increment = counter.target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= counter.target) {
        counter.value = counter.target;
        clearInterval(interval);
      } else {
        counter.value = Math.floor(current);
      }
    }, duration / steps);
  });
};

const bimTools = [
  { name: 'IFC Game', description: 'Explora modelos BIM en un entorno 3D interactivo con controles intuitivos.', icon: 'controller', route: '/ifcGame', gradient: 'from-indigo-600 to-purple-700' },
  { name: 'IFC VR', description: 'Sumérgete en tus proyectos con realidad virtual inmersiva.', icon: 'virtual-reality', route: '/ifcVR', gradient: 'from-blue-600 to-cyan-700' },
  { name: 'IFC AR', description: 'Visualiza modelos BIM en el mundo real con realidad aumentada.', icon: 'augmented-reality', route: '/ifcAR', gradient: 'from-teal-600 to-emerald-700' },
];
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">

    <!-- HERO -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900"></div>
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      </div>

      <div class="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <img src="../assets/logo.png" alt="FLynx" class="h-24 md:h-32 mx-auto mb-8 drop-shadow-2xl" />
        <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Construyendo el futuro del sector
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">AECO</span>
        </h1>
        <p class="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Innovación BIM, construcción sostenible e impacto social. Integramos tecnología, investigación y desarrollo para transformar la industria de la construcción.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/proyectos"
            class="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105">
            Explorar Proyectos
          </router-link>
          <router-link to="/ifcGame"
            class="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105">
            Probar BIM Viewer
          </router-link>
        </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <mdicon name="chevron-double-down" class="text-white/50" size="32" />
      </div>
    </section>

    <!-- SERVICIOS -->
    <section class="py-20 px-6 bg-white dark:bg-slate-900">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-4">
          Soluciones Integrales
        </h2>
        <p class="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Ofrecemos un portafolio completo de servicios para el sector AECO
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="service in services" :key="service.title"
            class="group p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              :class="service.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'">
              <mdicon :name="service.icon" size="24" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">{{ service.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ service.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TERRITORIAL TWIN DESTACADO -->
    <section class="py-20 px-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-cyan-950">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium mb-6 border border-emerald-500/30">
              <mdicon name="application-outline" size="14" />
              Desktop App v0.1.0
            </div>
            <h2 class="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Territorial<span class="text-emerald-400">Twin</span>
            </h2>
            <p class="text-lg text-gray-300 mb-6">
              La plataforma de gemelo digital territorial para profesionales de infraestructura. Geoespacial + BIM + IoT en un solo viewport.
            </p>
            <div class="flex flex-wrap gap-3 mb-8">
              <span class="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">CesiumJS + Three.js</span>
              <span class="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">IFC & Fragments</span>
              <span class="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">GeoJSON & GeoTIFF</span>
              <span class="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">MQTT IoT</span>
              <span class="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">Offline</span>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <router-link to="/territorial-twin"
                class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold rounded-full hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:scale-105">
                <mdicon name="download" size="18" />
                Descargar
              </router-link>
              <router-link to="/territorial-twin"
                class="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/10 transition-all duration-300">
                Ver más
                <mdicon name="arrow-right" size="16" />
              </router-link>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <mdicon name="layers-triple" class="text-emerald-400 mb-2" size="28" />
              <h4 class="text-white font-medium text-sm mb-1">3D/2D Unificado</h4>
              <p class="text-gray-400 text-xs">Globo + BIM sincronizados</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <mdicon name="cube-scan" class="text-cyan-400 mb-2" size="28" />
              <h4 class="text-white font-medium text-sm mb-1">BIM Georreferenciado</h4>
              <p class="text-gray-400 text-xs">IFC con coordenadas EPSG</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <mdicon name="road-variant" class="text-emerald-400 mb-2" size="28" />
              <h4 class="text-white font-medium text-sm mb-1">Civil Navigator</h4>
              <p class="text-gray-400 text-xs">Corredores y alineamientos</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <mdicon name="access-point" class="text-cyan-400 mb-2" size="28" />
              <h4 class="text-white font-medium text-sm mb-1">IoT en Tiempo Real</h4>
              <p class="text-gray-400 text-xs">Sensores MQTT + dashboards</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DIGITAL TERRAIN DESTACADO -->
    <section class="py-20 px-6 bg-gradient-to-br from-slate-900 via-amber-950 to-orange-950">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="order-2 lg:order-1 grid grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <mdicon name="chart-scatter-plot" class="text-amber-400 mb-2" size="28" />
              <h4 class="text-white font-medium text-sm mb-1">250M+ Puntos</h4>
              <p class="text-gray-400 text-xs">Motor LOD con octree</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <mdicon name="gpu" class="text-orange-400 mb-2" size="28" />
              <h4 class="text-white font-medium text-sm mb-1">GPU WebGPU</h4>
              <p class="text-gray-400 text-xs">Clasificación en tu GPU local</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <mdicon name="cube-scan" class="text-amber-400 mb-2" size="28" />
              <h4 class="text-white font-medium text-sm mb-1">BIM + LiDAR</h4>
              <p class="text-gray-400 text-xs">IFC sobre nubes de puntos</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <mdicon name="chart-line-variant" class="text-orange-400 mb-2" size="28" />
              <h4 class="text-white font-medium text-sm mb-1">Secciones Transversales</h4>
              <p class="text-gray-400 text-xs">BIM + nube sincronizados</p>
            </div>
          </div>
          <div class="order-1 lg:order-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium mb-6 border border-amber-500/30">
              <mdicon name="gpu" size="14" />
              GPU-Accelerated &middot; v0.1.0
            </div>
            <h2 class="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Digital <span class="text-amber-400">Terrain</span>
            </h2>
            <p class="text-lg text-gray-300 mb-6">
              Procesamiento LiDAR y BIM de escritorio con aceleración GPU. Clasificación automática de nubes de puntos masivas vía WebGPU.
            </p>
            <div class="flex flex-wrap gap-3 mb-8">
              <span class="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">Rust + Tauri v2</span>
              <span class="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">WebGPU / WGSL</span>
              <span class="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">LAS / LAZ / E57</span>
              <span class="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">IFC + Fragments</span>
              <span class="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs">DXF Export</span>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <router-link to="/digital-terrain"
                class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-full hover:from-amber-500 hover:to-orange-500 transition-all duration-300 shadow-lg hover:scale-105">
                <mdicon name="download" size="18" />
                Descargar
              </router-link>
              <router-link to="/digital-terrain"
                class="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/10 transition-all duration-300">
                Ver más
                <mdicon name="arrow-right" size="16" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TECNOLOGÍA BIM WEB -->
    <section class="py-20 px-6 bg-[#1E293B]">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          BIM Viewer Web
        </h2>
        <p class="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Herramientas de visualización BIM directamente en tu navegador
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="tool in bimTools" :key="tool.name"
            class="group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br transition-all duration-500 hover:scale-105 hover:shadow-2xl"
            :class="tool.gradient">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <mdicon :name="tool.icon" class="text-white/80 mb-4" size="48" />
            <h3 class="text-2xl font-bold text-white mb-3">{{ tool.name }}</h3>
            <p class="text-white/70 mb-6">{{ tool.description }}</p>
            <router-link :to="tool.route"
              class="inline-flex items-center gap-2 px-5 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300">
              Probar
              <mdicon name="arrow-right" size="16" />
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- VISIÓN Y MISIÓN -->
    <section class="py-20 px-6 bg-gray-50 dark:bg-slate-800">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Nuestra Esencia
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatedCard
            variant="purple"
            title="Visión"
            description="Aspiramos a ser referentes en el sector AECO, impulsando innovación, excelencia y desarrollo sostenible. Integramos investigación y transferencia tecnológica para construir un futuro más eficiente y seguro."
          />
          <AnimatedCard
            variant="purple"
            title="Misión"
            description="Ofrecemos soluciones integrales en consultoría, construcción y formación. A través de un enfoque innovador y sostenible, generamos impacto positivo en la sociedad y lideramos el progreso del sector."
          />
        </div>
      </div>
    </section>

    <!-- ESTADÍSTICAS -->
    <section ref="statsRef" class="py-16 px-6 bg-gradient-to-r from-teal-800 to-cyan-900">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div v-for="stat in counters" :key="stat.label">
            <div class="text-4xl md:text-5xl font-bold text-white mb-2">
              {{ stat.value }}{{ stat.suffix }}
            </div>
            <div class="text-cyan-200 text-sm md:text-base">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="py-20 px-6 bg-white dark:bg-slate-900">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
          ¿Listos para transformar la construcción?
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Únete a la revolución del sector AECO. Trabajamos contigo para llevar tus proyectos al siguiente nivel.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/industria-comunidad"
            class="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-full hover:from-teal-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:scale-105">
            Conocer Más
          </router-link>
          <router-link to="/proyectos"
            class="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-semibold rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105">
            Ver Proyectos
          </router-link>
        </div>
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center text-sm">
          <a href="mailto:admin@flynx.co" class="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            <mdicon name="email-outline" size="16" /> admin@flynx.co
          </a>
          <!-- <a href="mailto:wilmercampagna@gmail.com" class="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            <mdicon name="email-outline" size="16" /> wilmercampagna@gmail.com
          </a> -->
        </div>
      </div>
    </section>

  </div>
</template>
