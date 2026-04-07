<script setup>
const features = [
  {
    icon: 'chart-scatter-plot',
    title: 'Visualización de Alto Rendimiento',
    description: 'Motor de renderizado LOD con octree jerárquico para más de 250 millones de puntos. Múltiples modos de color (RGB, elevación, intensidad, clasificación), iluminación Eye Dome Lighting y control completo de apariencia.',
  },
  {
    icon: 'gpu',
    title: 'Clasificación Automática por GPU',
    description: 'Pipelines de procesamiento ejecutados directamente en la GPU vía WebGPU. Filtro de Simulación de Tela (CSF), Altura Sobre el Terreno (HAG), Análisis de Componentes Principales (PCA) y extracción de líneas de quiebre.',
  },
  {
    icon: 'cube-scan',
    title: 'Integración BIM/IFC Completa',
    description: 'Carga de modelos IFC (v2.0+) con georreferenciación automática. Extracción de alineamientos de corredor vial desde IFC4X3. Navegación sincronizada entre vista 3D, planta y sección transversal.',
  },
  {
    icon: 'chart-line-variant',
    title: 'Sección Transversal Interactiva',
    description: 'Visualización de secciones transversales del corredor con navegación por abscisa (KP). Superposición simultánea del corte BIM y la franja de nube de puntos con espesor configurable.',
  },
  {
    icon: 'ruler-square-compass',
    title: 'Herramientas de Medición',
    description: 'Medición de distancia 3D, área y volumen. Selección interactiva por lazo, brocha circular y filtro de altura. Section Box para recorte por caja alineada a ejes.',
  },
  {
    icon: 'layers-outline',
    title: 'Gestión de Capas Jerárquica',
    description: 'Sistema de capas padre-hijo donde la nube original genera sub-capas por clasificación (suelo, no-suelo, vegetación). Cada capa se puede controlar y exportar independientemente.',
  },
];

const gpuPipelines = [
  { name: 'Filtro CSF', description: 'Separación automática terreno/no-terreno con presets para terreno plano, ondulado, escarpado, vía urbana y corredor forestal.', icon: 'terrain' },
  { name: 'Altura HAG', description: 'Clasificación ASPRS de vegetación baja, media y alta a partir del modelo digital de terreno.', icon: 'pine-tree' },
  { name: 'Análisis PCA', description: 'Detección de estructuras lineales (líneas eléctricas), planares (techos, muros) y volumétricas (vegetación densa).', icon: 'vector-polyline' },
  { name: 'Líneas de Quiebre', description: 'Detección automática de crestas y valles para MDT/MDE, con exportación a DXF.', icon: 'chart-timeline-variant-shimmer' },
];

const inputFormats = ['LAS / LAZ', 'PLY', 'E57', 'XYZ / PTS', 'IFC (v2.0+)'];
const outputFormats = ['LAS (clasificación preservada)', 'DXF (líneas de quiebre)', 'Potree v2 (web)', 'Fragments (BIM comprimido)'];

const systemReqs = [
  { component: 'Sistema Operativo', min: 'Windows 10 (64-bit)', rec: 'Windows 11' },
  { component: 'GPU', min: 'Compatible WebGPU / Vulkan', rec: 'NVIDIA RTX 3060+' },
  { component: 'VRAM', min: '4 GB', rec: '8 GB+' },
  { component: 'RAM', min: '8 GB', rec: '16 GB+' },
  { component: 'Almacenamiento', min: '500 MB (instalación)', rec: 'SSD recomendado' },
];

const useCases = [
  { icon: 'road-variant', title: 'Corredores Viales', description: 'Clasificación de terreno + alineamiento IFC + secciones transversales automáticas' },
  { icon: 'terrain', title: 'Topografía y MDT', description: 'Extracción de líneas de quiebre + exportación DXF para Civil 3D' },
  { icon: 'pine-tree', title: 'Inventario Forestal', description: 'Clasificación de vegetación por altura sobre el terreno (HAG)' },
  { icon: 'transmission-tower', title: 'Infraestructura Eléctrica', description: 'Detección automática de líneas de transmisión y postes (PCA)' },
  { icon: 'hard-hat', title: 'Control de Obra', description: 'Superposición BIM georreferenciado sobre nube de puntos as-built' },
  { icon: 'city-variant-outline', title: 'Urbanismo', description: 'Detección de techos, muros y estructuras planares en nubes urbanas' },
];

const techStack = [
  { label: 'Frontend', value: 'React + TypeScript + Three.js + potree-core + @thatopen/components' },
  { label: 'Backend', value: 'Rust + Tauri v2 + wgpu (WebGPU nativo)' },
  { label: 'GPU Compute', value: 'Shaders WGSL vía WebGPU con dispatch 2D' },
  { label: 'Formatos', value: 'las-rs, ply-rs, e57, web-ifc, dxf' },
];

const downloadUrl = 'https://github.com/adminflynx/DigitalTerrain/releases';
</script>

<template>
  <div class="min-h-screen pt-16">

    <!-- HERO -->
    <section class="relative py-24 px-6 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-amber-950 to-orange-950"></div>
      <div class="absolute inset-0 opacity-15">
        <div class="absolute top-10 left-20 w-80 h-80 bg-amber-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute bottom-10 right-20 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1.5s;"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-8 border border-amber-500/30">
          <mdicon name="gpu" size="16" />
          GPU-Accelerated &middot; v0.1.0
        </div>

        <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Digital <span class="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">Terrain</span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
          Procesamiento LiDAR y BIM de escritorio con aceleración GPU.
        </p>
        <p class="text-gray-400 mb-10 max-w-2xl mx-auto">
          Clasificación automática de nubes de puntos, integración BIM/IFC completa y herramientas de ingeniería civil — todo procesado en tu GPU local vía WebGPU.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a :href="downloadUrl" target="_blank" rel="noopener"
            class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-full hover:from-amber-500 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 hover:scale-105">
            <mdicon name="download" size="20" />
            Descargar para Windows
          </a>
        </div>

        <p class="mt-6 text-sm text-gray-500">Windows 10/11 (64-bit) &middot; GPU WebGPU/Vulkan requerida &middot; ~500 MB</p>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" class="py-20 px-6 bg-white dark:bg-slate-900">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-4">
          Características Principales
        </h2>
        <p class="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Procesamiento profesional de nubes de puntos con potencia de GPU
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="feature in features" :key="feature.title"
            class="group p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <mdicon :name="feature.icon" class="text-amber-600 dark:text-amber-400" size="24" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">{{ feature.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- GPU PIPELINES -->
    <section class="py-20 px-6 bg-[#1E293B]">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Pipelines de Clasificación GPU
        </h2>
        <p class="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Procesamiento masivo ejecutado directamente en tu GPU vía WebGPU — sin servicios en la nube
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="pipeline in gpuPipelines" :key="pipeline.name"
            class="flex gap-5 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all duration-300">
            <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <mdicon :name="pipeline.icon" class="text-amber-400" size="28" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-white mb-2">{{ pipeline.name }}</h3>
              <p class="text-gray-400 text-sm leading-relaxed">{{ pipeline.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FORMATOS -->
    <section class="py-20 px-6 bg-white dark:bg-slate-900">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Formatos Soportados
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <mdicon name="import" class="text-amber-500" size="20" /> Entrada
            </h3>
            <div class="space-y-2">
              <div v-for="fmt in inputFormats" :key="fmt"
                class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                <mdicon name="file-outline" class="text-gray-400" size="18" />
                <span class="text-gray-700 dark:text-gray-300 text-sm">{{ fmt }}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <mdicon name="export" class="text-amber-500" size="20" /> Salida
            </h3>
            <div class="space-y-2">
              <div v-for="fmt in outputFormats" :key="fmt"
                class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                <mdicon name="file-check-outline" class="text-gray-400" size="18" />
                <span class="text-gray-700 dark:text-gray-300 text-sm">{{ fmt }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- REQUISITOS -->
    <section class="py-20 px-6 bg-gray-50 dark:bg-slate-800">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Requisitos del Sistema
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-300 dark:border-gray-600">
                <th class="text-left p-3 text-gray-500 dark:text-gray-400 font-medium">Componente</th>
                <th class="text-left p-3 text-gray-500 dark:text-gray-400 font-medium">Mínimo</th>
                <th class="text-left p-3 text-gray-500 dark:text-gray-400 font-medium">Recomendado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in systemReqs" :key="req.component"
                class="border-b border-gray-200 dark:border-gray-700">
                <td class="p-3 font-medium text-gray-800 dark:text-white">{{ req.component }}</td>
                <td class="p-3 text-gray-500 dark:text-gray-400">{{ req.min }}</td>
                <td class="p-3 text-amber-600 dark:text-amber-400 font-medium">{{ req.rec }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- CASOS DE USO -->
    <section class="py-20 px-6 bg-white dark:bg-slate-900">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Casos de Uso
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="uc in useCases" :key="uc.title"
            class="flex gap-4 p-5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300">
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <mdicon :name="uc.icon" class="text-amber-600 dark:text-amber-400" size="20" />
            </div>
            <div>
              <h4 class="font-semibold text-gray-800 dark:text-white mb-1">{{ uc.title }}</h4>
              <p class="text-gray-500 dark:text-gray-400 text-xs">{{ uc.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STACK TÉCNICO -->
    <section class="py-20 px-6 bg-[#1E293B]">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Stack Tecnológico
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="tech in techStack" :key="tech.label"
            class="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <span class="text-amber-400 text-sm font-medium min-w-[80px]">{{ tech.label }}</span>
            <span class="text-gray-300 text-sm">{{ tech.value }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- DOWNLOAD CTA -->
    <section class="py-20 px-6 bg-gradient-to-r from-amber-900 to-orange-900">
      <div class="max-w-4xl mx-auto text-center">
        <mdicon name="terrain" class="text-white/30 mb-6" size="64" />
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Descarga Digital Terrain
        </h2>
        <p class="text-gray-300 mb-4">Versión 0.1.0 &middot; Windows 10/11 (64-bit) &middot; GPU WebGPU requerida</p>
        <p class="text-gray-400 text-sm mb-8 max-w-xl mx-auto">
          Desarrollado por Wilmer Campagna en Fundación Lynx (FLynx).
        </p>
        <a :href="downloadUrl" target="_blank" rel="noopener"
          class="inline-flex items-center gap-3 px-10 py-5 bg-white text-amber-900 font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl hover:scale-105 text-lg">
          <mdicon name="download" size="24" />
          Descargar Ahora
        </a>
      </div>
    </section>

  </div>
</template>
