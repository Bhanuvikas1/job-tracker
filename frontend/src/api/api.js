import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // IMPORTANT for session cookie
});

// --- AUTH ---
export const loginApi = (email, password) => api.post("/api/auth/login", { email, password });
export const registerApi = (name, email, password) => api.post("/api/auth/register", { name, email, password });
export const logoutApi = () => api.post("/api/auth/logout");
export const meApi = () => api.get("/api/auth/me");

// --- APPLICATIONS ---
export const listApplicationsApi = () => api.get("/api/applications");
export const createApplicationApi = (payload) => api.post("/api/applications", payload);
export const updateStatusApi = (id, payload) => api.put(`/api/applications/${id}/status`, payload);
export const deleteApplicationApi = (id) => api.delete(`/api/applications/${id}`);

// ✅ NEW: TIMELINE / HISTORY
export const getApplicationHistoryApi = (id) => api.get(`/api/applications/${id}/history`);

export default api;
