<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getLicenses, createLicense, deleteLicense, getProducts } from '../../api/licenses.js';

const router = useRouter();
const route = useRoute();
const licenses = ref([]);
const products = ref([]);
const total = ref(0);
const loading = ref(true);
const error = ref(null);

const searchQuery = ref('');
const filterStatus = ref('');
const filterPlan = ref('');
const filterProductId = ref(route.query.productId || '');

const showCreateModal = ref(false);
const showKeyModal = ref(false);
const createdKey = ref('');
const createForm = ref({ email: '', productId: '', plan: 'pro', maxActivations: 2, expiresAt: '', notes: '' });
const creating = ref(false);

const statusColors = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  revoked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  suspended: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};

const planColors = {
  trial: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  pro: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  enterprise: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const fetchLicenses = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filterStatus.value) params.status = filterStatus.value;
    if (filterPlan.value) params.plan = filterPlan.value;
    if (filterProductId.value) params.productId = filterProductId.value;
    if (searchQuery.value) params.search = searchQuery.value;
    const result = await getLicenses(params);
    licenses.value = result.data;
    total.value = result.total;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const fetchProducts = async () => {
  try {
    products.value = await getProducts();
    if (products.value.length && !createForm.value.productId) {
      createForm.value.productId = products.value[0].id;
    }
  } catch (err) {
    // products will stay empty
  }
};

const handleCreate = async () => {
  creating.value = true;
  try {
    const result = await createLicense({
      email: createForm.value.email,
      productId: createForm.value.productId,
      plan: createForm.value.plan,
      maxActivations: createForm.value.maxActivations,
      expiresAt: createForm.value.expiresAt,
      notes: createForm.value.notes || undefined,
    });
    createdKey.value = result.key;
    showCreateModal.value = false;
    showKeyModal.value = true;
    createForm.value = { email: '', productId: products.value[0]?.id || '', plan: 'pro', maxActivations: 2, expiresAt: '', notes: '' };
    await fetchLicenses();
  } catch (err) {
    error.value = err.message;
  } finally {
    creating.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm('¿Eliminar esta licencia permanentemente?')) return;
  try {
    await deleteLicense(id);
    await fetchLicenses();
  } catch (err) {
    error.value = err.message;
  }
};

const applyFilters = () => fetchLicenses();

const copyKey = () => navigator.clipboard.writeText(createdKey.value);

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(async () => {
  await fetchProducts();
  await fetchLicenses();
});
</script>

<template>
  <div class="min-h-screen pt-20 px-6 bg-gray-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Licencias</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ total }} licencias en total</p>
        </div>
        <button @click="showCreateModal = true"
          class="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all text-sm font-medium">
          <mdicon name="plus" size="18" />
          Nueva Licencia
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-6">
        <input v-model="searchQuery" @keyup.enter="applyFilters" type="text" placeholder="Buscar por email..."
          class="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        <select v-model="filterProductId" @change="applyFilters"
          class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">Todos los productos</option>
          <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
        <select v-model="filterStatus" @change="applyFilters"
          class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">Todos los estados</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
          <option value="suspended">Suspended</option>
        </select>
        <select v-model="filterPlan" @change="applyFilters"
          class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">Todos los planes</option>
          <option value="trial">Trial</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-6 flex items-center justify-between">
        <span>{{ error }}</span>
        <button @click="error = null" class="text-red-400 hover:text-red-300"><mdicon name="close" size="18" /></button>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th class="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Producto</th>
                <th class="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Key</th>
                <th class="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Email</th>
                <th class="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Plan</th>
                <th class="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                <th class="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Activaciones</th>
                <th class="text-left p-4 text-gray-500 dark:text-gray-400 font-medium">Expira</th>
                <th class="text-right p-4 text-gray-500 dark:text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="p-8 text-center text-gray-400">Cargando...</td>
              </tr>
              <tr v-else-if="licenses.length === 0">
                <td colspan="8" class="p-8 text-center text-gray-400">No se encontraron licencias</td>
              </tr>
              <tr v-for="lic in licenses" :key="lic.id"
                class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-750">
                <td class="p-4">
                  <span class="text-xs text-gray-600 dark:text-gray-300">{{ lic.product?.name || '-' }}</span>
                </td>
                <td class="p-4 font-mono text-xs text-gray-600 dark:text-gray-300">{{ lic.key }}</td>
                <td class="p-4 text-gray-800 dark:text-white">{{ lic.email }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 rounded-full text-xs font-medium" :class="planColors[lic.plan]">{{ lic.plan }}</span>
                </td>
                <td class="p-4">
                  <span class="px-2 py-1 rounded-full text-xs font-medium" :class="statusColors[lic.status]">{{ lic.status }}</span>
                </td>
                <td class="p-4 text-gray-600 dark:text-gray-300">
                  {{ lic._count?.activations || 0 }}/{{ lic.maxActivations }}
                </td>
                <td class="p-4 text-gray-600 dark:text-gray-300">{{ formatDate(lic.expiresAt) }}</td>
                <td class="p-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <router-link :to="`/admin/licenses/${lic.id}`"
                      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors">
                      <mdicon name="eye-outline" size="18" />
                    </router-link>
                    <button @click="handleDelete(lic.id)"
                      class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                      <mdicon name="delete-outline" size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showCreateModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">Nueva Licencia</h2>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Producto</label>
            <select v-model="createForm.productId" required
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input v-model="createForm.email" type="email" required
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
            <select v-model="createForm.plan"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="trial">Trial</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Activaciones</label>
            <input v-model.number="createForm.maxActivations" type="number" min="1" max="100"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Expiración</label>
            <input v-model="createForm.expiresAt" type="date" required
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas (opcional)</label>
            <input v-model="createForm.notes" type="text"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
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

    <!-- Key Created Modal -->
    <div v-if="showKeyModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showKeyModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl text-center">
        <mdicon name="check-circle" class="text-green-500 mb-4" size="48" />
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Licencia Creada</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">Copia este key y envíalo al cliente:</p>
        <div class="flex items-center gap-2 p-3 bg-gray-100 dark:bg-slate-700 rounded-xl mb-6">
          <code class="flex-1 text-sm font-mono text-purple-600 dark:text-purple-400 select-all">{{ createdKey }}</code>
          <button @click="copyKey" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 transition-colors">
            <mdicon name="content-copy" size="18" />
          </button>
        </div>
        <button @click="showKeyModal = false"
          class="w-full py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all text-sm">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
