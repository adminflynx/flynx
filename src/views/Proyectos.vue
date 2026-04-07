<script setup>
import { ref, computed } from 'vue';
import { projects, categories } from '../data/projects.js';

const selectedCategory = ref('Todos');

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'Todos') return projects;
  return projects.filter(p => p.category === selectedCategory.value);
});

const statusColors = {
  'En Curso': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Completado': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Planificacion': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const categoryColors = {
  'Construccion': 'bg-purple-500',
  'Consultoria': 'bg-blue-500',
  'I+D': 'bg-emerald-500',
};
</script>

<template>
  <div class="min-h-screen pt-16">

    <!-- HEADER -->
    <section class="py-20 px-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-6">Nuestros Proyectos</h1>
        <p class="text-lg text-gray-300 max-w-2xl mx-auto">
          Cada proyecto refleja nuestro compromiso con la innovación, la sostenibilidad y el impacto social en el sector de la construcción.
        </p>
      </div>
    </section>

    <!-- FILTROS -->
    <section class="py-8 px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-6xl mx-auto flex flex-wrap gap-3 justify-center">
        <button v-for="cat in categories" :key="cat"
          @click="selectedCategory = cat"
          class="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300"
          :class="selectedCategory === cat
            ? 'bg-purple-600 text-white shadow-lg'
            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'">
          {{ cat }}
        </button>
      </div>
    </section>

    <!-- GRID DE PROYECTOS -->
    <section class="py-12 px-6 bg-gray-50 dark:bg-slate-900">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="project in filteredProjects" :key="project.id"
            class="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">

            <!-- Color bar -->
            <div class="h-2" :class="categoryColors[project.category] || 'bg-gray-400'"></div>

            <div class="p-6">
              <!-- Category & Status -->
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">
                  {{ project.category }}
                </span>
                <span class="text-xs font-medium px-3 py-1 rounded-full" :class="statusColors[project.status]">
                  {{ project.status }}
                </span>
              </div>

              <!-- Title -->
              <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {{ project.title }}
              </h3>

              <!-- Description -->
              <p class="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {{ project.description }}
              </p>

              <!-- Role -->
              <div v-if="project.role" class="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 mb-3">
                <mdicon name="briefcase-outline" size="14" />
                <span>{{ project.role }}</span>
              </div>

              <!-- Client & Partner -->
              <div class="space-y-1 mb-3">
                <div v-if="project.client" class="flex items-center gap-1 text-xs text-gray-400">
                  <mdicon name="domain" size="14" />
                  <span>{{ project.client }}</span>
                </div>
                <div v-if="project.partner" class="flex items-center gap-1 text-xs text-gray-400">
                  <mdicon name="handshake-outline" size="14" />
                  <span>{{ project.partner }}</span>
                </div>
              </div>

              <!-- Location -->
              <div class="flex items-center gap-1 text-xs text-gray-400">
                <mdicon name="map-marker-outline" size="14" />
                <span>{{ project.location }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredProjects.length === 0" class="text-center py-20">
          <mdicon name="folder-open-outline" class="text-gray-300 dark:text-gray-600 mb-4" size="64" />
          <p class="text-gray-500 dark:text-gray-400">No hay proyectos en esta categoría.</p>
        </div>
      </div>
    </section>

  </div>
</template>
