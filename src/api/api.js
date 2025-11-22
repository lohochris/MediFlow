// src/api/api.js

import axios from "axios";
import toast from "react-hot-toast";
import {
  getCurrentUser,
  saveRefreshedUser,
  clearUser,
} from "../services/authService";

/**
 * BASE URL
 * Do NOT put /api here — routes in services already include /api
 */
const API_BASE =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send cookies for refresh token
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

    // Handle unauthorized & prevent infinite loops
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        // call refresh endpoint
        const refreshRes = await api.post("/api/auth/refresh");

        const { accessToken } = refreshRes.data;
        if (!accessToken) throw new Error("Invalid refresh response");

        // Save new token + retry request
        saveRefreshedUser(accessToken);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshErr) {
        // refresh failed → force logout
        toast.error("Session expired. Please log in again.");
        clearUser();
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;
