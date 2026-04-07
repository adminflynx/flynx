import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { login as apiLogin } from '../api/licenses.js';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || null);
  const user = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'));
  const error = ref(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value);

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await apiLogin(email, password);
      token.value = data.token;
      user.value = data.user;
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      return true;
    } catch (err) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  return { token, user, error, loading, isAuthenticated, login, logout };
});
