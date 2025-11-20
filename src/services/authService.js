// src/services/authService.js
import api from "../api/api";

// ---------------------------------------------
// LOCAL STORAGE HELPERS
// ---------------------------------------------
const USER_KEY = "mediflow-user";

export function saveUser(user) {
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

// ---------------------------------------------
// LOGIN (email + password)
// Returns a unified user object: { ...user, accessToken }
// ---------------------------------------------
export async function loginUser(email, password) {
  const res = await api.post("/auth/login", { email, password });

  const fullUser = {
    ...res.data.user,
    accessToken: res.data.accessToken,
  };

  saveUser(fullUser);

  return fullUser; // 🔥 this fixes RBAC routing
}

// ---------------------------------------------
// REGISTER
// ---------------------------------------------
export async function registerUser(name, email, password) {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
}

// ---------------------------------------------
// LOGOUT
// ---------------------------------------------
export async function logoutUser() {
  try {
    await api.post("/auth/logout");
  } catch {}
  clearUser();
}

// ---------------------------------------------
// FETCH CURRENT USER (GET /users/me)
// Backend sends full profile (role, dept, etc.)
// We merge it with stored accessToken only.
// ---------------------------------------------
export async function fetchCurrentUser() {
  try {
    const profile = await api.get("/users/me");
    const stored = getCurrentUser();

    const merged = {
      ...profile.data,          // backend role, email, name, department
      accessToken: stored?.accessToken, // keep token
    };

    saveUser(merged);
    return merged;
  } catch {
    return null;
  }
}

// ---------------------------------------------
// SAVE NEW TOKEN FROM REFRESH MIDDLEWARE
// ---------------------------------------------
export function saveRefreshedUser(newAccessToken) {
  const existing = getCurrentUser();
  if (!existing) return;

  const merged = {
    ...existing,
    accessToken: newAccessToken,
  };

  saveUser(merged);
}

// ---------------------------------------------
// GOOGLE LOGIN SUPPORT
// ---------------------------------------------
export function saveGoogleLogin(accessToken, user) {
  const merged = {
    ...user,
    accessToken,
  };

  saveUser(merged);
  return merged;
}

export function loginWithGoogle() {
  window.location.href = "http://localhost:5000/auth/google";
}
