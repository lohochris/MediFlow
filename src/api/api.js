// src/api/api.js

import axios from "axios";
import toast from "react-hot-toast";
import {
  getCurrentUser,
  saveRefreshedUser,
  clearUser,
} from "../services/authService";

/**
 * BACKEND BASE URL
 * This MUST come from Vite env during build:
 * VITE_BACKEND_URL = https://mediflow-backend-ckj2.onrender.com
 */
const API_BASE = (import.meta.env.VITE_BACKEND_URL || "")
  .replace(/\/$/, "")
  .trim();

if (!API_BASE) {
  console.error("❌ ERROR: VITE_BACKEND_URL is missing! API calls will fail.");
}

/**
 * AXIOS INSTANCE
 */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send cookies (refresh token)
});

/* ----------------------------------------------------
   REQUEST INTERCEPTOR — Attach Access Token
---------------------------------------------------- */
api.interceptors.request.use((config) => {
  const user = getCurrentUser();
  const token = user?.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ----------------------------------------------------
   RESPONSE INTERCEPTOR — Handle 401 with Refresh Token
---------------------------------------------------- */
api.interceptors.response.use(
  (res) => res,

  async (err) => {
    const original = err.config;

    // If request already retried, stop here
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        // Request new token
        const refreshRes = await api.post("/api/auth/refresh");
        const { accessToken } = refreshRes.data;

        if (!accessToken) {
          throw new Error("Refresh token response missing accessToken");
        }

        // Save refreshed token
        saveRefreshedUser(accessToken);

        // Retry failed request
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);

      } catch (refreshErr) {
        toast.error("Session expired. Please log in again.");
        clearUser();
        window.location.href = "/login";
      }
    }

    // Return original error
    return Promise.reject(err);
  }
);

export default api;
