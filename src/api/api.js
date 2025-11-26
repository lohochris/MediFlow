// src/api/api.js

import axios from "axios";
import {
  getCurrentUser,
  saveUser,
  clearUser,
  refreshToken,
} from "../services/authService";
import toast from "react-hot-toast";

// ... (API_BASE definition) ...

/* ============================================================================
   BACKEND BASE URL (Correctly defined here)
============================================================================ */
const API_BASE = (import.meta.env.VITE_BACKEND_URL || "")
  .replace(/\/$/, "")
  .trim();

if (!API_BASE) {
  console.error("❌ ERROR: VITE_BACKEND_URL is missing! API calls may fail.");
}

/* ============================================================================
   AXIOS INSTANCE (cookie-enabled)
============================================================================ */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // refresh token cookie is included
});

/* ============================================================================
   REQUEST INTERCEPTOR → Attaches Bearer Token
============================================================================ */
api.interceptors.request.use((config) => {
  const user = getCurrentUser();
  const token = user?.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ============================================================================
   RESPONSE INTERCEPTOR → Auto Refresh on 401 and Force Logout on Failure
============================================================================ */
api.interceptors.response.use(
  (res) => res,

  async (err) => {
    const original = err.config;
    const status = err.response?.status;
    const isRefreshEndpoint = original.url.includes('/auth/refresh'); 
    
    // Check if the refresh logic should run
    if (
        status === 401 && 
        !original._retry &&
        !isRefreshEndpoint
    ) {
      original._retry = true;

      try {
        const refreshed = await refreshToken(); // calls POST /api/auth/refresh

        if (!refreshed?.accessToken) {
          throw new Error("Refresh did not return a valid access token");
        }

        // Store refreshed session
        saveUser(refreshed);

        // Retry original request with new access token
        original.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return api(original);

      } catch (refreshErr) {
        console.warn("🔻 Refresh failed: Refresh Token is likely expired.", refreshErr);

        toast.error("Session expired. Please log in again.");

        clearUser();

        // Route user to login (your login page is "/")
        window.location.href = "/";
        // Prevent further execution for this error path
        return Promise.reject(err); 
      }
    }

    // ⭐ FINAL GLOBAL LOGOUT CHECK (NEW LOGIC ADDED HERE)
    // If we get a 401 but couldn't retry (e.g., refresh endpoint failed, or already retried), 
    // or if the refresh endpoint itself failed with 401, force logout.
    if (status === 401) {
        console.warn("Global 401 catch: Forcing logout.");
        clearUser();
        window.location.href = "/";
    }

    // Reject the promise for any other error status code
    return Promise.reject(err);
  }
);

export default api;