// src/api/api.js
import axios from "axios";
import toast from "react-hot-toast";
import {
  getCurrentUser,
  saveRefreshedUser,
  clearUser
} from "../services/authService";

const API_BASE =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // required for refresh cookie
});

// --------------------------------------------------------------------
// 1. ATTACH ACCESS TOKEN TO EVERY REQUEST
// --------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const user = getCurrentUser();
  const token = user?.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --------------------------------------------------------------------
// 2. HANDLE 401 → TRY REFRESH → RETRY REQUEST
// backend RETURNS: { accessToken, user }
// --------------------------------------------------------------------
api.interceptors.response.use(
  (res) => res,

  async (err) => {
    const original = err.config;

    // Only attempt refresh ONCE
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        // Request new access token from backend
        const refreshRes = await api.post("/auth/refresh", {}, { withCredentials: true });

        const { accessToken } = refreshRes.data;

        if (!accessToken) {
          throw new Error("Refresh token failed (no accessToken)");
        }

        // Save refreshed token in localStorage
        saveRefreshedUser(accessToken);

        // Retry original request with the new token
        original.headers.Authorization = `Bearer ${accessToken}`;

        return api(original);

      } catch (refreshErr) {
        console.error("🔐 Refresh Token Error:", refreshErr.message);

        toast.error("Session expired. Please log in again.");

        clearUser();
        window.location.href = "/";
      }
    }

    return Promise.reject(err);
  }
);

export default api;
