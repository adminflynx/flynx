<script setup>
const features = [
  {
    icon: 'layers-triple',
    title: 'Viewport Unificado 3D/2D',
    description: 'Visualiza imágenes de globo CesiumJS y modelos BIM de Three.js simultáneamente en canvases apilados con cámaras sincronizadas. Cambia entre perspectiva 3D, mapa ortográfico 2D y vista de planta Civil Navigator.',
  },
  {
    icon: 'cube-scan',
    title: 'Integración BIM',
    description: 'Carga archivos IFC y Fragment (.frag) con georreferenciación automática. Los modelos se posicionan con precisión en el globo usando transformaciones de coordenadas EPSG. Selecciona elementos individuales con raycasting a nivel de triángulo.',
  },
  {
    icon: 'map-marker-multiple',
    title: 'Capas Geoespaciales',
    description: 'Carga datos vectoriales GeoJSON, imágenes raster GeoTIFF y 3D Tiles. Dibuja puntos, líneas y polígonos directamente en el mapa con esquemas de atributos personalizados. Todo almacenado como GeoJSON estándar (RFC 7946).',
  },
  {
    icon: 'road-variant',
    title: 'Herramientas de Ingeniería Civil',
    description: 'Navegación de alineamientos de corredor con vista de planta 2D sincronizada, viewport 3D y slider de estación KP. Diseñado para proyectos de carreteras, ferrocarriles y ductos.',
  },
  {
    icon: 'access-point',
    title: 'Monitoreo IoT',
    description: 'Conéctate a brokers MQTT para visualización de datos de sensores en tiempo real. Coloca estaciones IoT en el mapa con sensores configurables, dashboards y gráficos de series temporales.',
  },
  {
    icon: 'file-cabinet',
    title: 'Archivos de Proyecto (.twinproj)',
    description: 'Guarda tu proyecto completo — capas, estilos, estado de vista y grupos personalizados — en un solo archivo comprimido. Comparte vía Dropbox, OneDrive o cualquier servicio. Ábrelo en cualquier máquina.',
  },
  {
    icon: 'format-list-group',
    title: 'Gestión de Capas',
    description: 'Organiza capas en grupos personalizados con drag-and-drop. Estilizado por capa con color, opacidad, iconos de marcador y ancho de línea. Tablas de atributos con ordenamiento, filtrado y edición inline.',
  },
];

const specs = [
  { label: 'Plataforma', value: 'Windows 10/11 (64-bit)' },
  { label: 'Renderizado', value: 'CesiumJS + Three.js (WebGL)' },
  { label: 'Formatos BIM', value: 'IFC 2x3/4, Fragment (.frag)' },
  { label: 'Formatos GIS', value: 'GeoJSON, GeoTIFF, 3D Tiles' },
  { label: 'Protocolo IoT', value: 'MQTT sobre WebSocket' },
  { label: 'Formato Proyecto', value: '.twinproj (ZIP comprimido)' },
  { label: 'Estándar GeoJSON', value: 'IETF RFC 7946' },
  { label: 'Offline', value: 'Funcionalidad completa sin internet' },
];

const audiences = [
  { icon: 'road-variant', text: 'Ingenieros Civiles gestionando corredores de carreteras, ferrocarriles y ductos' },
  { icon: 'map-search', text: 'Planificadores Territoriales analizando uso de suelo y cobertura de infraestructura' },
  { icon: 'access-point', text: 'Gestores de Infraestructura monitoreando activos con sensores IoT' },
  { icon: 'earth', text: 'Profesionales GIS integrando modelos BIM con datos geoespaciales' },
  { icon: 'hard-hat', text: 'Equipos de Construcción visualizando el progreso del proyecto en contexto' },
];

const downloadUrl = 'https://github.com/adminflynx/TerritorialTwin/releases';
</script>

<template>
  <div class="min-h-screen pt-16">

    <!-- HERO -->
    <section class="relative py-24 px-6 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-cyan-950"></div>
      <div class="absolute inset-0 opacity-15">
        <div class="absolute top-10 right-20 w-80 h-80 bg-emerald-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div class="absolute bottom-10 left-20 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse" style="animation-delay: 1.5s;"></div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-8 border border-emerald-500/30">
          <mdicon name="application-outline" size="16" />
          Desktop Application v0.1.0
        </div>

        <h1 class="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Territorial<span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Twin</span>
        </h1>
        <p class="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
          La plataforma de gemelo digital territorial para profesionales de infraestructura.
        </p>
        <p class="text-gray-400 mb-10 max-w-2xl mx-auto">
          Visualización geoespacial, modelos BIM de infraestructura y monitoreo IoT en tiempo real — todo en un solo viewport unificado.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a :href="downloadUrl" target="_blank" rel="noopener"
            class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold rounded-full hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 hover:scale-105">
            <mdicon name="download" size="20" />
            Descargar para Windows
          </a>
        </div>

        <p class="mt-6 text-sm text-gray-500">Windows 10/11 (64-bit) &middot; ~300 MB</p>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="features" class="py-20 px-6 bg-white dark:bg-slate-900">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-4">
          Características Principales
        </h2>
        <p class="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Todo lo que necesitas para gestionar infraestructura territorial en una sola herramienta
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="feature in features" :key="feature.title"
            class="group p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
              <mdicon :name="feature.icon" class="text-emerald-600 dark:text-emerald-400" size="24" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">{{ feature.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SPECS -->
    <section class="py-20 px-6 bg-[#1E293B]">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Especificaciones Técnicas
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="spec in specs" :key="spec.label"
            class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <span class="text-gray-400 text-sm">{{ spec.label }}</span>
            <span class="text-white font-medium text-sm">{{ spec.value }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- AUDIENCIA -->
    <section class="py-20 px-6 bg-gray-50 dark:bg-slate-800">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          ¿Para quién es?
        </h2>
        <div class="space-y-4">
          <div v-for="audience in audiences" :key="audience.text"
            class="flex items-center gap-4 p-5 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300">
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <mdicon :name="audience.icon" class="text-emerald-600 dark:text-emerald-400" size="20" />
            </div>
            <p class="text-gray-700 dark:text-gray-300">{{ audience.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- DOWNLOAD CTA -->
    <section class="py-20 px-6 bg-gradient-to-r from-emerald-900 to-cyan-900">
      <div class="max-w-4xl mx-auto text-center">
        <mdicon name="application-outline" class="text-white/30 mb-6" size="64" />
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Descarga TerritorialTwin Desktop
        </h2>
        <p class="text-gray-300 mb-4">Versión 0.1.0 &middot; Windows 10/11 (64-bit) &middot; ~300 MB</p>
        <p class="text-gray-400 text-sm mb-8 max-w-xl mx-auto">
          Desarrollado por Wilmer Campagna en Fundación Lynx (FLynx).
        </p>
        <a :href="downloadUrl" target="_blank" rel="noopener"
          class="inline-flex items-center gap-3 px-10 py-5 bg-white text-emerald-900 font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl hover:scale-105 text-lg">
          <mdicon name="download" size="24" />
          Descargar Ahora
        </a>
      </div>
    </section>

  </div>
</template>
