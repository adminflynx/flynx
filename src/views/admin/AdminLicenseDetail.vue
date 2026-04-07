<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getLicense, updateLicense, deactivateMachine } from '../../api/licenses.js';

const route = useRoute();
const router = useRouter();
const license = ref(null);
const loading = ref(true);
const error = ref(null);
const showEditModal = ref(false);

const editForm = ref({ plan: '', maxActivations: 0, expiresAt: '', status: '', notes: '' });

const statusColors = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  revoked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  suspended: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};

const fetchLicense = async () => {
  loading.value = true;
  try {
    license.value = await getLicense(route.params.id);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const openEdit = () => {
  editForm.value = {
    plan: license.value.plan,
    maxActivations: license.value.maxActivations,
    expiresAt: license.value.expiresAt?.split('T')[0] || '',
    status: license.value.status,
    notes: license.value.notes || '',
  };
  showEditModal.value = true;
};

const handleUpdate = async () => {
  try {
    await updateLicense(route.params.id, editForm.value);
    showEditModal.value = false;
    await fetchLicense();
  } catch (err) {
    error.value = err.message;
  }
};

const quickAction = async (status) => {
  try {
    await updateLicense(route.params.id, { status });
    await fetchLicense();
  } catch (err) {
    error.value = err.message;
  }
};

const handleDeactivate = async (activationId) => {
  if (!confirm('¿Desactivar esta máquina?')) return;
  try {
    await deactivateMachine(activationId);
    await fetchLicense();
  } catch (err) {
    error.value = err.message;
  }
};

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const copyKey = () => {
  if (license.value) navigator.clipboard.writeText(license.value.key);
};

onMounted(fetchLicense);
</script>

<template>
  <div class="min-h-screen pt-20 px-6 bg-gray-50 dark:bg-slate-900">
    <div class="max-w-5xl mx-auto">

      <button @click="router.push('/admin/licenses')"
        class="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-6 text-sm transition-colors">
        <mdicon name="arrow-left" size="18" />
        Volver a Licencias
      </button>

      <div v-if="loading" class="text-center py-20 text-gray-400">Cargando...</div>
      <div v-else-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">{{ error }}</div>

      <template v-else-if="license">
        <!-- License Info -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div class="flex items-center gap-2 mb-3">
                <mdicon name="application-outline" size="18" class="text-gray-400" />
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ license.product?.name || '-' }}</span>
              </div>
              <div class="flex items-center gap-3 mb-2">
                <h1 class="text-xl font-bold text-gray-800 dark:text-white font-mono">{{ license.key }}</h1>
                <button @click="copyKey" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 transition-colors">
                  <mdicon name="content-copy" size="16" />
                </button>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-medium" :class="statusColors[license.status]">{{ license.status }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button @click="openEdit"
                class="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all text-sm flex items-center gap-2">
                <mdicon name="pencil-outline" size="16" /> Editar
              </button>
              <button v-if="license.status === 'active'" @click="quickAction('suspended')"
                class="px-4 py-2 border border-amber-400 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-sm">
                Suspender
              </button>
              <button v-if="license.status === 'active'" @click="quickAction('revoked')"
                class="px-4 py-2 border border-red-400 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm">
                Revocar
              </button>
              <button v-if="license.status === 'suspended' || license.status === 'revoked'" @click="quickAction('active')"
                class="px-4 py-2 border border-green-400 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-sm">
                Reactivar
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
              <div class="text-sm text-gray-800 dark:text-white font-medium">{{ license.email }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan</div>
              <div class="text-sm text-gray-800 dark:text-white font-medium capitalize">{{ license.plan }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Activaciones</div>
              <div class="text-sm text-gray-800 dark:text-white font-medium">{{ license.activations?.length || 0 }} / {{ license.maxActivations }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Expira</div>
              <div class="text-sm text-gray-800 dark:text-white font-medium">{{ formatDate(license.expiresAt) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Creada</div>
              <div class="text-sm text-gray-800 dark:text-white">{{ formatDate(license.createdAt) }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Actualizada</div>
              <div class="text-sm text-gray-800 dark:text-white">{{ formatDate(license.updatedAt) }}</div>
            </div>
            <div v-if="license.notes" class="col-span-2">
              <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Notas</div>
              <div class="text-sm text-gray-800 dark:text-white">{{ license.notes }}</div>
            </div>
          </div>
        </div>

        <!-- Activations -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-bold text-gray-800 dark:text-white">Activaciones</h2>
          </div>
          <div v-if="!license.activations?.length" class="p-8 text-center text-gray-400">
            <mdicon name="monitor-off" class="mb-2" size="32" />
            <p>No hay máquinas activadas</p>
          </div>
          <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
            <div v-for="act in license.activations" :key="act.id"
              class="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-750">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <mdicon name="monitor" class="text-blue-600 dark:text-blue-400" size="20" />
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-800 dark:text-white">{{ act.machineName }}</div>
                  <div class="text-xs text-gray-400 font-mono">{{ act.machineId }}</div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right hidden sm:block">
                  <div class="text-xs text-gray-500 dark:text-gray-400">Activada: {{ formatDate(act.activatedAt) }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Verificada: {{ formatDate(act.lastVerifiedAt) }}</div>
                </div>
                <button @click="handleDeactivate(act.id)"
                  class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  title="Desactivar máquina">
                  <mdicon name="link-off" size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showEditModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-6">Editar Licencia</h2>
        <form @submit.prevent="handleUpdate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan</label>
            <select v-model="editForm.plan"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="trial">Trial</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select v-model="editForm.status"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Activaciones</label>
            <input v-model.number="editForm.maxActivations" type="number" min="1"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Expiración</label>
            <input v-model="editForm.expiresAt" type="date"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
            <input v-model="editForm.notes" type="text"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showEditModal = false"
              class="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm">
              Cancelar
            </button>
            <button type="submit"
              class="flex-1 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all text-sm">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
