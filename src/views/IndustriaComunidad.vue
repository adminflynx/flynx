<script setup>
const industryBlocks = [
  {
    icon: 'cube-scan',
    title: 'Transferencia Tecnológica BIM',
    description: 'Conectamos la investigación académica con la industria de la construcción, desarrollando herramientas BIM de código abierto que democratizan el acceso a tecnología de punta. Nuestro visor IFC con soporte AR/VR es prueba de ello.',
  },
  {
    icon: 'flask-outline',
    title: 'I+D e Innovación',
    description: 'Impulsamos proyectos de investigación en colaboración con universidades y centros de innovación, anticipando las tendencias del sector y generando soluciones aplicables a la realidad constructiva colombiana.',
  },
  {
    icon: 'school-outline',
    title: 'Formación Profesional',
    description: 'Capacitamos a profesionales del sector constructor en metodologías BIM, gestión de proyectos y construcción sostenible, cerrando la brecha entre la formación académica y las necesidades de la industria.',
  },
];

const communityBlocks = [
  {
    icon: 'hand-heart-outline',
    title: 'Infraestructura para la Paz',
    description: 'Desarrollamos proyectos de infraestructura en comunidades vulnerables y territorios afectados por el conflicto, contribuyendo a la reconciliación y el desarrollo territorial.',
  },
  {
    icon: 'seed-outline',
    title: 'Inversión Social',
    description: 'Dedicamos el excedente de nuestro ejercicio a causas sociales, reinvirtiendo en las comunidades donde operamos para generar un ciclo virtuoso de desarrollo.',
  },
  {
    icon: 'leaf',
    title: 'Desarrollo Sostenible',
    description: 'Promovemos prácticas constructivas responsables con el medio ambiente, integrando criterios de sostenibilidad en cada etapa de nuestros proyectos.',
  },
];

const values = [
  { icon: 'shield-check-outline', title: 'Integridad', description: 'Actuamos con transparencia y ética en cada decisión.' },
  { icon: 'target', title: 'Disciplina', description: 'Compromiso riguroso con la excelencia y los resultados.' },
  { icon: 'account-heart-outline', title: 'Respeto', description: 'Valoramos a las personas, las comunidades y el entorno.' },
];
</script>

<template>
  <div class="min-h-screen pt-16">

    <!-- HEADER -->
    <section class="py-20 px-6 bg-gradient-to-r from-blue-900 to-teal-900">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-6">Industria y Comunidad</h1>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">
          Impulsamos la transformación del sector AECO mientras generamos impacto positivo en las comunidades donde operamos.
        </p>
      </div>
    </section>

    <!-- INDUSTRIA -->
    <section class="py-20 px-6 bg-white dark:bg-slate-900">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center gap-3 mb-12">
          <div class="w-1 h-10 bg-blue-500 rounded-full"></div>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Impacto en la Industria AECO
          </h2>
        </div>
        <div class="space-y-12">
          <div v-for="(block, index) in industryBlocks" :key="block.title"
            class="flex flex-col md:flex-row items-center gap-8"
            :class="index % 2 !== 0 ? 'md:flex-row-reverse' : ''">
            <div class="flex-shrink-0 w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <mdicon :name="block.icon" class="text-blue-600 dark:text-blue-400" size="36" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-3">{{ block.title }}</h3>
              <p class="text-gray-500 dark:text-gray-400 leading-relaxed">{{ block.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- COMUNIDAD -->
    <section class="py-20 px-6 bg-gray-50 dark:bg-slate-800">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center gap-3 mb-12">
          <div class="w-1 h-10 bg-teal-500 rounded-full"></div>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Compromiso con la Comunidad
          </h2>
        </div>
        <div class="space-y-12">
          <div v-for="(block, index) in communityBlocks" :key="block.title"
            class="flex flex-col md:flex-row items-center gap-8"
            :class="index % 2 !== 0 ? 'md:flex-row-reverse' : ''">
            <div class="flex-shrink-0 w-20 h-20 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <mdicon :name="block.icon" class="text-teal-600 dark:text-teal-400" size="36" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-3">{{ block.title }}</h3>
              <p class="text-gray-500 dark:text-gray-400 leading-relaxed">{{ block.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- VALORES -->
    <section class="py-20 px-6 bg-white dark:bg-slate-900">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">
          Nuestros Valores
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="val in values" :key="val.title"
            class="text-center p-8 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <div class="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <mdicon :name="val.icon" class="text-purple-600 dark:text-purple-400" size="28" />
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">{{ val.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ val.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA ALIANZAS -->
    <section class="py-20 px-6 bg-gradient-to-r from-purple-900 to-indigo-900">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Únete a nuestra red</h2>
        <p class="text-gray-300 mb-8 max-w-2xl mx-auto">
          Buscamos aliados estratégicos en la academia, la industria y el sector público para multiplicar nuestro impacto.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a href="mailto:admin@flynx.co"
            class="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:scale-105">
            <mdicon name="email-outline" size="18" />
            admin@flynx.co
          </a>
          <!-- <a href="mailto:wilmercampagna@gmail.com"
            class="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <mdicon name="email-outline" size="18" />
            wilmercampagna@gmail.com
          </a> -->
        </div>
      </div>
    </section>

  </div>
</template>
