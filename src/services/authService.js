// src/services/authService.js

/**
 * Auth service — client-side helpers for login / logout / refresh token handling
 * - Uses the central `api` axios instance (../api/api)
 * - Unified user object stored under "mediflow-user"
 */

import api from "../api/api";

const USER_KEY = "mediflow-user";

/* -------------------------
   Local storage helpers
   ------------------------- */
export function saveUser(user) {
  if (!user) return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn("saveUser failed:", e);
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn("clearUser failed:", e);
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* -------------------------
   Helper: format server error
   ------------------------- */
const formatError = (err) => {
  if (!err) return new Error("Unknown error");
  if (err.response?.data?.error) return new Error(err.response.data.error);
  if (err.response?.data?.message) return new Error(err.response.data.message);
  if (err.message) return new Error(err.message);
  return new Error("Request failed");
};

/* -------------------------
   LOGIN - email + password
   ------------------------- */
export async function loginUser(email, password) {
  if (!email || !password) throw new Error("Email and password are required");

  try {
    const res = await api.post("/api/auth/login", { email, password });
    const fetchedUser = res.data?.user || null;
    const accessToken = res.data?.accessToken || null;

    if (!fetchedUser) {
      throw new Error("Login response missing user");
    }

    const fullUser = { ...fetchedUser, accessToken };
    saveUser(fullUser);

    return fullUser;
  } catch (err) {
    throw formatError(err);
  }
}

/* -------------------------
   REGISTER
   ------------------------- */
export async function registerUser(name, email, password) {
  if (!name || !email || !password)
    throw new Error("Name, email and password are required");

  try {
    const res = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

/* -------------------------
   LOGOUT
   ------------------------- */
export async function logoutUser() {
  try {
    await api.post("/api/auth/logout");
  } catch (err) {
    console.warn("logoutUser: server logout failed", err?.message || err);
  } finally {
    clearUser();
  }
}

/* -------------------------
   FETCH CURRENT USER
   ------------------------- */
export async function fetchCurrentUser() {
  try {
    const res = await api.get("/api/users/me");
    const profile = res.data;

    const stored = getCurrentUser();
    const merged = {
      ...profile,
      accessToken: stored?.accessToken || null,
    };

    saveUser(merged);
    return merged;
  } catch (err) {
    console.warn("fetchCurrentUser failed:", err?.message || err);
    return null;
  }
}

/* -------------------------
   SAVE REFRESHED TOKEN
   ------------------------- */
export function saveRefreshedUser(newAccessToken) {
  if (!newAccessToken) return;

  const existing = getCurrentUser();
  if (!existing) return;

  const merged = {
    ...existing,
    accessToken: newAccessToken,
  };

  saveUser(merged);
}

/* -------------------------
   GOOGLE LOGIN
   ------------------------- */
export function saveGoogleLogin(accessToken, user) {
  if (!accessToken || !user) return null;

  const merged = { ...user, accessToken };
  saveUser(merged);

  return merged;
}

export function loginWithGoogle() {
  // Redirect to backend Google OAuth entrypoint
  window.location.href = "/api/auth/google";
}

/* -------------------------
   AUTH CHECK
   ------------------------- */
export function isAuthenticated() {
  const u = getCurrentUser();
  return !!(u && u.accessToken);
}
