<script setup>
import { ref, onMounted } from 'vue';
import { getStats, getProducts } from '../../api/licenses.js';

const stats = ref({ total: 0, active: 0, expired: 0, revoked: 0, suspended: 0, activationsToday: 0 });
const products = ref([]);
const loading = ref(true);
const error = ref(null);

const statCards = [
  { key: 'total', label: 'Total Licencias', icon: 'key-variant', color: 'purple' },
  { key: 'active', label: 'Activas', icon: 'check-circle-outline', color: 'green' },
  { key: 'expired', label: 'Expiradas', icon: 'clock-alert-outline', color: 'amber' },
  { key: 'revoked', label: 'Revocadas', icon: 'cancel', color: 'red' },
  { key: 'suspended', label: 'Suspendidas', icon: 'pause-circle-outline', color: 'gray' },
];

const colorMap = {
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

onMounted(async () => {
  try {
    const [statsData, productsData] = await Promise.all([getStats(), getProducts()]);
    stats.value = statsData;
    products.value = productsData;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen pt-20 px-6 bg-gray-50 dark:bg-slate-900">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm">License Management Overview</p>
        </div>
        <div class="flex gap-2">
          <router-link to="/admin/products"
            class="inline-flex items-center gap-2 px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-sm font-medium">
            <mdicon name="package-variant-closed" size="18" />
            Productos
          </router-link>
          <router-link to="/admin/licenses"
            class="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all text-sm font-medium">
            <mdicon name="format-list-bulleted" size="18" />
            Licencias
          </router-link>
        </div>
      </div>

      <div v-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-6">
        {{ error }}
      </div>

      <!-- Products -->
      <div v-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <router-link v-for="p in products" :key="p.id" :to="`/admin/licenses?productId=${p.id}`"
          class="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <mdicon name="application-outline" size="24" />
          </div>
          <div>
            <div class="font-semibold text-gray-800 dark:text-white">{{ p.name }}</div>
            <div class="text-xs text-gray-400">{{ p._count?.licenses || 0 }} licencias</div>
          </div>
        </router-link>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div v-for="card in statCards" :key="card.key"
          class="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3" :class="colorMap[card.color]">
            <mdicon :name="card.icon" size="20" />
          </div>
          <div class="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {{ loading ? '...' : stats[card.key] }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ card.label }}</div>
        </div>
      </div>

      <div v-if="!loading" class="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="flex items-center gap-3 mb-2">
          <mdicon name="lightning-bolt" class="text-cyan-500" size="20" />
          <span class="text-gray-800 dark:text-white font-medium">Activaciones hoy</span>
        </div>
        <div class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.activationsToday || 0 }}</div>
      </div>
    </div>
  </div>
</template>
