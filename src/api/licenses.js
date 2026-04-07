const API_PROD = "https://licenses-api.flynx.co";
const API_DEV = "http://localhost:3200";
const DEV_MODE = import.meta.env.DEV;
const API = DEV_MODE ? API_DEV : API_PROD;

// ── Auth helpers ───────────────────────────────────────────────
const getToken = () => localStorage.getItem("admin_token");

const authHeaders = (withAuth = true) => {
  const h = { "Content-Type": "application/json" };
  if (withAuth) {
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.hash = "#/admin/login";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ── Auth ───────────────────────────────────────────────────────
export const login = async (email, password) => {
  const res = await fetch(`${API}/admin/login`, {
    method: "POST",
    headers: authHeaders(false),
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

// ── Products ───────────────────────────────────────────────────
export const getProducts = async () => {
  const res = await fetch(`${API}/admin/products`, { headers: authHeaders() });
  return handleResponse(res);
};

export const createProduct = async (data) => {
  const res = await fetch(`${API}/admin/products`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ── Stats ──────────────────────────────────────────────────────
export const getStats = async () => {
  const res = await fetch(`${API}/admin/stats`, { headers: authHeaders() });
  return handleResponse(res);
};

// ── Licenses ───────────────────────────────────────────────────
export const getLicenses = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.plan) query.set("plan", params.plan);
  if (params.productId) query.set("productId", params.productId);
  if (params.search) query.set("search", params.search);
  if (params.offset) query.set("offset", String(params.offset));
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  const res = await fetch(`${API}/admin/licenses${qs ? "?" + qs : ""}`, { headers: authHeaders() });
  return handleResponse(res);
};

export const getLicense = async (id) => {
  const res = await fetch(`${API}/admin/licenses/${id}`, { headers: authHeaders() });
  return handleResponse(res);
};

export const createLicense = async (data) => {
  const res = await fetch(`${API}/admin/licenses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateLicense = async (id, data) => {
  const res = await fetch(`${API}/admin/licenses/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteLicense = async (id) => {
  const res = await fetch(`${API}/admin/licenses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
};

// ── Activations ────────────────────────────────────────────────
export const getActivations = async (licenseId) => {
  const res = await fetch(`${API}/admin/licenses/${licenseId}/activations`, { headers: authHeaders() });
  return handleResponse(res);
};

export const deactivateMachine = async (activationId) => {
  const res = await fetch(`${API}/admin/activations/${activationId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
};
