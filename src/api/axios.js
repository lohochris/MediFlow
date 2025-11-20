// src/api/axios.js
import axios from "axios";
import { getToken, setToken, clearToken } from "./tokenStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // send/receive cookies (refresh token)
});

// Request: attach access token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: if 401, try refresh once and retry original request
let isRefreshing = false;
let refreshPromise = null;

async function doRefresh() {
  try {
    const resp = await api.post("/auth/refresh"); // backend sets rotated refresh cookie and returns new access token
    const newAccessToken = resp.data.accessToken;
    setToken(newAccessToken);
    return newAccessToken;
  } catch (err) {
    clearToken();
    throw err;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // only attempt refresh for 401 and if we didn't already try refresh for this request
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = doRefresh()
          .catch((e) => {
            // refresh failed
            throw e;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        // retry original request with new token
        const token = getToken();
        if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (err) {
        // failed refresh -> propagate
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
