<script setup>
import { ref } from 'vue';

const features = [
  {
    icon: 'rocket-launch-outline',
    title: 'Aplicacion 100% nativa',
    description: 'Reescrita en Rust + wgpu + eframe. Sin navegador, sin Node, sin web workers. Renderizado directo por GPU con LOD, frustum y occlusion culling.',
  },
  {
    icon: 'database-outline',
    title: 'Nubes de cualquier tamano',
    description: 'Carga eficiente con chunking y buffers compartidos. Sincronizacion GPU-CPU sin copias redundantes.',
  },
  {
    icon: 'gpu',
    title: 'CSF por GPU con cancelacion',
    description: 'Filtro de Simulacion de Tela ejecutado en GPU, con la posibilidad de cancelar mid-process. Mas rapido y estable.',
  },
  {
    icon: 'pine-tree-variant-outline',
    title: 'HAG mejorado',
    description: 'Height Above Ground con parametros expuestos. Clasifica vegetacion baja, media y alta a partir del modelo digital de terreno.',
  },
  {
    icon: 'auto-fix',
    title: 'Refinar suelo (nuevo)',
    description: 'Recupera puntos de terreno que CSF omitio analizando ventanas vecinas. Mejora la fidelidad del DTM final.',
  },
  {
    icon: 'broom',
    title: 'Limpiar suelo (nuevo)',
    description: 'Filtro residual DTM que demota a ruido los puntos sobre la superficie. Resultado limpio listo para topografia.',
  },
  {
    icon: 'lasso',
    title: 'Lazo + pincel interactivo',
    description: 'Correcciones manuales en 3D y en seccion transversal. Selecciona, reclasifica y ajusta a mano lo que el algoritmo no acerto.',
  },
  {
    icon: 'shape-polygon-plus',
    title: 'Perimetros alpha-shape (nuevo)',
    description: 'Concave hull real de los puntos de terreno. Lineas oblicuas adaptadas al borde, no escalonadas como otras herramientas.',
  },
  {
    icon: 'vector-polyline',
    title: 'Breaklines GPU',
    description: 'Detectadas automaticamente por GPU a partir de cambios de pendiente. O extraidas desde alineamiento con offsets configurables.',
  },
];

const civil3DExports = [
  { icon: 'file-document-outline', name: 'LandXML Surface TIN', detail: 'Importacion directa via Insert -> LandXML. Crea la Surface automaticamente con breaklines nombradas como TIN constraints y perimetro como Outer Boundary.' },
  { icon: 'file-table-outline', name: 'ASCII Points (ENZ/PENZD)', detail: 'Para COGO Import Points via ReCap. Compatible con flujos topograficos clasicos.' },
  { icon: 'vector-difference', name: 'DXF multi-capa', detail: 'Breaklines (ridge/valley/alineamiento), perimetros y lineas auxiliares en capas separadas.' },
  { icon: 'database-export-outline', name: 'LAS 1.4 con clasificaciones', detail: 'Exporta la nube completa con todas las clasificaciones consolidadas, lista para otros software.' },
];

const bimCivilFeatures = [
  { icon: 'cube-scan', text: 'Carga IFC con georreferenciacion automatica (alineamientos, mallas)' },
  { icon: 'road-variant', text: 'Navegador civil con seguimiento de camara por estacion (KP)' },
  { icon: 'chart-line-variant', text: 'Seccion transversal sincronizada (puntos + IFC + mediciones)' },
  { icon: 'export-variant', text: 'Exportacion DXF de seccion 2D' },
];

const otherTools = [
  { icon: 'ruler-square-compass', text: 'Medicion 2D (distancias, areas)' },
  { icon: 'earth', text: 'Reproyeccion CRS (EPSG/proj4)' },
  { icon: 'content-save-outline', text: 'Session save/load (.dt2 con clasificaciones, alineamientos y breaklines)' },
];

const systemReqs = [
  { component: 'Sistema Operativo', value: 'Windows 10/11 x64' },
  { component: 'GPU', value: 'Driver Vulkan o DirectX 12 (NVIDIA, AMD, Intel Arc)' },
  { component: 'RAM minima', value: '8 GB' },
  { component: 'RAM recomendada', value: '16+ GB para nubes >100M puntos' },
  { component: 'Instalador', value: 'NSIS — per-user o machine-wide' },
];

const screenshots = [
  { src: '/digitalTerrainImg/screenshot-1.png', caption: 'Visualizacion de nube de puntos clasificada por GPU' },
  { src: '/digitalTerrainImg/screenshot-2.png', caption: 'Navegador civil con seccion transversal sincronizada' },
  { src: '/digitalTerrainImg/screenshot-3.png', caption: 'Integracion BIM/IFC con georreferenciacion' },
];

const downloadUrl = 'https://github.com/wilmercampagna/flynx-releases/releases/tag/dt-v2.0';
const manualUrl = '/digitalTerrainImg/ManualUsuarioDT.pdf';

const lightboxOpen = ref(false);
const lightboxIndex = ref(0);
const openLightbox = (i) => { lightboxIndex.value = i; lightboxOpen.value = true; };
const closeLightbox = () => { lightboxOpen.value = false; };
const nextImg = () => { lightboxIndex.value = (lightboxIndex.value + 1) % screenshots.length; };
const prevImg = () => { lightboxIndex.value = (lightboxIndex.value - 1 + screenshots.length) % screenshots.length; };
</script>

<template>
  <div class="min-h-screen pt-16">

    <!-- HERO (dark blue/cyan, uses icon-only logo to avoid white background issue) -->
    <section class="relative py-20 px-6 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-950"></div>
      <div class="absolute inset-0 opacity-15">
        <div class="absolute top-10 left-20 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute bottom-10 right-20 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1.5s;"></div>
      </div>

      <div class="relative z-10 max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium mb-6 border border-cyan-500/30">
              <mdicon name="rocket-launch" size="16" />
              Version 2.0 &middot; Rust nativo
            </div>

            <h1 class="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Digital <span class="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Terrain</span>
            </h1>

            <p class="text-xl md:text-2xl text-gray-300 mb-4">
              Procesamiento LiDAR nativo con aceleracion GPU.
            </p>
            <p class="text-gray-400 mb-8 max-w-xl">
              Reescrita 100% en Rust. Mas rapida, mas estable, con pipelines GPU ampliados y workflow completo hacia Civil 3D.
            </p>

            <div class="flex flex-col sm:flex-row gap-4">
              <a :href="downloadUrl" target="_blank" rel="noopener"
                class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 hover:scale-105">
                <mdicon name="download" size="20" />
                Descargar v2.0
              </a>
              <a :href="manualUrl" target="_blank" rel="noopener" download
                class="inline-flex items-center gap-3 px-8 py-4 border-2 border-cyan-400/40 text-cyan-300 font-semibold rounded-full hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:scale-105">
                <mdicon name="file-document-outline" size="20" />
                Manual de Usuario (PDF)
              </a>
            </div>

            <p class="mt-6 text-sm text-gray-500">
              <code class="text-cyan-300">dt2_0.1.0_x64-setup.exe</code> &middot; Windows 10/11 x64
            </p>
          </div>

          <div class="hidden lg:flex justify-center">
            <div class="relative">
              <div class="absolute inset-0 bg-cyan-500/30 rounded-full blur-3xl"></div>
              <img src="/digitalTerrainImg/LogoDT.png" alt="Digital Terrain Logo" class="relative h-64 w-64 object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHAT'S NEW IN V2 (light section — perfect for the white-background text logo) -->
    <section class="py-16 px-6 bg-white dark:bg-slate-900 border-y border-blue-100 dark:border-blue-900/30">
      <div class="max-w-5xl mx-auto text-center">
        <!-- Logo with text on white card so its white background blends -->
        <div class="flex justify-center mb-6">
          <div class="bg-white p-5 rounded-2xl shadow-md border border-blue-100">
            <img src="/digitalTerrainImg/LogoTextDT.png" alt="Digital Terrain" class="h-16 md:h-20 w-auto" />
          </div>
        </div>

        <div class="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-bold mb-4 border border-cyan-500/30">
          NOVEDAD
        </div>
        <h2 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
          De DT1 a DT2 — reescritura nativa en Rust
        </h2>
        <p class="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          DT2 abandona el navegador y los web workers. Ahora corre <strong class="text-cyan-600 dark:text-cyan-400">100% nativa</strong>
          con renderizado GPU directo, manejo de nubes masivas con chunking, y un pipeline de clasificacion ampliado con
          herramientas nuevas de refinamiento manual.
        </p>
      </div>
    </section>

    <!-- SCREENSHOTS GALLERY -->
    <section class="py-20 px-6 bg-gray-50 dark:bg-slate-800">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-4">
          Software en accion
        </h2>
        <p class="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Capturas de DT2 procesando nubes reales
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button v-for="(shot, i) in screenshots" :key="shot.src"
            @click="openLightbox(i)"
            class="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left">
            <img :src="shot.src" :alt="shot.caption" class="w-full h-48 object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span class="text-white text-sm font-medium">{{ shot.caption }}</span>
            </div>
            <div class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <mdicon name="magnify-plus-outline" size="18" />
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" class="py-20 px-6 bg-white dark:bg-slate-900">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-4">
          Caracteristicas Principales
        </h2>
        <p class="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Procesamiento profesional con potencia de GPU nativa
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="feature in features" :key="feature.title"
            class="group p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
              <mdicon :name="feature.icon" class="text-blue-600 dark:text-cyan-400" size="24" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">{{ feature.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CIVIL 3D EXPORTS (dark) -->
    <section class="py-20 px-6 bg-[#0a1628]">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-bold mb-4 border border-cyan-500/30">
            INTEGRACION CIVIL 3D
          </div>
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Workflow completo a Civil 3D
          </h2>
          <p class="text-gray-400 max-w-2xl mx-auto">
            Exporta directamente formatos que Civil 3D entiende, sin pasos intermedios
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="exp in civil3DExports" :key="exp.name"
            class="flex gap-5 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all duration-300">
            <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <mdicon :name="exp.icon" class="text-cyan-300" size="28" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-white mb-2">{{ exp.name }}</h3>
              <p class="text-gray-400 text-sm leading-relaxed">{{ exp.detail }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BIM + CIVIL TOOLS -->
    <section class="py-20 px-6 bg-white dark:bg-slate-900">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          BIM + Civil
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div v-for="bf in bimCivilFeatures" :key="bf.text"
            class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <mdicon :name="bf.icon" class="text-blue-600 dark:text-cyan-400" size="20" />
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm">{{ bf.text }}</p>
          </div>
        </div>

        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Otras herramientas</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div v-for="t in otherTools" :key="t.text"
            class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <mdicon :name="t.icon" class="text-cyan-500" size="18" />
            <p class="text-gray-700 dark:text-gray-300 text-xs">{{ t.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- REQUIREMENTS -->
    <section class="py-20 px-6 bg-gray-50 dark:bg-slate-800">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Requisitos del Sistema
        </h2>
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table class="w-full text-sm">
            <tbody>
              <tr v-for="(req, i) in systemReqs" :key="req.component"
                class="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <td class="p-4 font-medium text-gray-800 dark:text-white w-1/2">{{ req.component }}</td>
                <td class="p-4 text-gray-500 dark:text-gray-400">{{ req.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- DOWNLOAD CTA -->
    <section class="py-20 px-6 bg-gradient-to-r from-blue-900 via-blue-800 to-cyan-900">
      <div class="max-w-4xl mx-auto text-center">
        <img src="/digitalTerrainImg/LogoDT.png" alt="" class="h-20 mx-auto mb-6 drop-shadow-2xl" />
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Descarga Digital Terrain v2.0
        </h2>
        <p class="text-gray-300 mb-2">Aplicacion nativa Rust &middot; Windows 10/11 x64</p>
        <p class="text-gray-400 text-sm mb-8 max-w-xl mx-auto">
          Desarrollado por Wilmer Campagna en Fundacion Lynx (FLynx).
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a :href="downloadUrl" target="_blank" rel="noopener"
            class="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-900 font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl hover:scale-105 text-lg">
            <mdicon name="download" size="24" />
            Descargar Ahora
          </a>
          <a :href="manualUrl" target="_blank" rel="noopener" download
            class="inline-flex items-center gap-3 px-10 py-5 border-2 border-white/40 text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105 text-lg">
            <mdicon name="file-document-outline" size="24" />
            Manual PDF
          </a>
        </div>
      </div>
    </section>

    <!-- LIGHTBOX -->
    <div v-if="lightboxOpen" @click.self="closeLightbox"
      class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <button @click="closeLightbox" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
        <mdicon name="close" size="22" />
      </button>
      <button @click="prevImg" class="absolute left-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
        <mdicon name="chevron-left" size="28" />
      </button>
      <button @click="nextImg" class="absolute right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
        <mdicon name="chevron-right" size="28" />
      </button>
      <div class="max-w-6xl max-h-[90vh] flex flex-col items-center gap-4">
        <img :src="screenshots[lightboxIndex].src" class="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
        <p class="text-white text-sm text-center">{{ screenshots[lightboxIndex].caption }}</p>
      </div>
    </div>

  </div>
</template>
