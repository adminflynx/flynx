<script setup>
import { ref, onMounted } from 'vue';
import { getProducts, createProduct } from '../../api/licenses.js';

const products = ref([]);
const loading = ref(true);
const error = ref(null);

const showCreateModal = ref(false);
const creating = ref(false);
const createForm = ref({ slug: '', name: '', description: '' });

const fetchProducts = async () => {
  loading.value = true;
  try {
    products.value = await getProducts();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const handleCreate = async () => {
  creating.value = true;
  try {
    await createProduct({
      slug: createForm.value.slug.trim().toLowerCase(),
      name: createForm.value.name.trim(),
      description: createForm.value.description.trim() || undefined,
    });
    showCreateModal.value = false;
    createForm.value = { slug: '', name: '', description: '' };
    await fetchProducts();
  } catch (err) {
    error.value = err.message;
  } finally {
    creating.value = false;
  }
};

const autoSlug = () => {
  if (!createForm.value.slug && createForm.value.name) {
    createForm.value.slug = createForm.value.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }
};

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(fetchProducts);
</script>

<template>
  <div class="min-h-screen pt-20 px-6 bg-gray-50 dark:bg-slate-900">
    <div class="max-w-6xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Productos</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm">Software products managed by FLynx</p>
        </div>
        <button @click="showCreateModal = true"
          class="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all text-sm font-medium">
          <mdicon name="plus" size="18" />
          Nuevo Producto
        </button>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-6 flex items-center justify-between">
        <span>{{ error }}</span>
        <button @click="error = null" class="text-red-400 hover:text-red-300"><mdicon name="close" size="18" /></button>
      </div>

      <!-- Products grid -->
      <div v-if="loading" class="text-center py-20 text-gray-400">Cargando...</div>
      <div v-else-if="products.length === 0" class="text-center py-20 text-gray-400">
        <mdicon name="package-variant-closed" class="mb-2" size="48" />
        <p>No hay productos registrados</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="product in products" :key="product.id"
          class="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <mdicon name="application-outline" size="24" />
            </div>
            <span class="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">
              {{ product._count?.licenses || 0 }} licencias
            </span>
          </div>

          <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ product.name }}</h3>
          <code class="text-xs font-mono text-purple-600 dark:text-purple-400">{{ product.slug }}</code>

          <p v-if="product.description" class="text-gray-500 dark:text-gray-400 text-sm mt-3">
            {{ product.description }}
          </p>

          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400">
            <span>Creado: {{ formatDate(product.createdAt) }}</span>
            <router-link :to="`/admin/licenses?productId=${product.id}`"
              class="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline">
              Ver licencias
              <mdicon name="arrow-right" size="14" />
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showCreateModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">Nuevo Producto</h2>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input v-model="createForm.name" @blur="autoSlug" type="text" required placeholder="TerritorialTwin Desktop"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
            <input v-model="createForm.slug" type="text" required placeholder="territorial-twin"
              pattern="[a-z0-9-]+"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <p class="text-xs text-gray-400 mt-1">Solo letras minúsculas, números y guiones. Se usa para generar el prefijo del key.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (opcional)</label>
            <textarea v-model="createForm.description" rows="3"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showCreateModal = false"
              class="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm">
              Cancelar
            </button>
            <button type="submit" :disabled="creating"
              class="flex-1 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all text-sm disabled:opacity-50">
              {{ creating ? 'Creando...' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
