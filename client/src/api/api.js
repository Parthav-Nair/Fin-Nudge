import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

// API wrappers
export const loginUser = (email, password) => api.post("/api/auth/login", { email, password });
export const registerUser = (name, email, password) => api.post("/api/auth/register", { name, email, password });
export const getTransactions = (page = 1, pageSize = 50) => api.get("/api/transactions", { params: { page, pageSize } });
export const getNudges = () => api.get("/api/nudges");
export const getNudgeMetrics = () => api.get("/api/nudges/metrics");

// Simple client-side cooldown (avoid accidental double-clicks)
let _lastAction = 0;
export function canDoAction(cooldownSec = 2) {
  const now = Date.now();
  if (now - _lastAction < cooldownSec * 1000) return false;
  _lastAction = now;
  return true;
}

// Interceptor: populate a global rate-limit timestamp on 429 and clear tokens on 401
api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    if (status === 401) {
      // fallback: clear local storage (AuthContext also handles this)
      try { localStorage.removeItem("token"); localStorage.removeItem("user"); } catch {}
    }
    if (status === 429) {
      const retryAfter = parseInt(err.response?.headers["retry-after"] || "5", 10);
      window.__apiRateLimitReset = Date.now() + retryAfter * 1000;
      err.rateLimit = { retryAfter };
    }
    return Promise.reject(err);
  }
);

export default api;
