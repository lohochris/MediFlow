// src/services/authService.js
import api from "../api/api";

/* =====================================================================
   LOCAL STORAGE
===================================================================== */
const STORAGE_KEY = "mediflow_user";

export const saveUser = (user) => {
  if (!user) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/* =====================================================================
   ⭐ GOOGLE LOGIN — required by OAuthSuccess.jsx
===================================================================== */
export const saveGoogleLogin = (token, userObj) => {
  if (!token || !userObj) return;

  // attach access token
  userObj.accessToken = token;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
};

/* =====================================================================
   NORMALIZE USER — single consistent structure
===================================================================== */
const normalizeUser = (backendUser, accessToken = null) => {
  if (!backendUser) return null;

  return {
    ...backendUser,
    accessToken,

    patientId:
      backendUser.patientId ??
      backendUser.patientProfile?._id ??
      null,

    patientProfile: backendUser.patientProfile ?? null,

    name: backendUser.name ?? "User",
  };
};

/* =====================================================================
   LOGIN
===================================================================== */
export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/api/auth/login", { email, password });

    const backendUser = res.data?.user;
    const token = res.data?.accessToken;

    const final = normalizeUser(backendUser, token);
    saveUser(final);

    return final;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Login failed");
  }
};

/* =====================================================================
   REGISTER (matches backend /api/auth/register)
===================================================================== */
export const registerUser = async ({ name, email, password }) => {
  try {
    const res = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });

    const backendUser = res.data?.user;
    const token = res.data?.accessToken;

    const final = normalizeUser(backendUser, token);
    saveUser(final);

    return final;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Registration failed");
  }
};

/* =====================================================================
   FETCH CURRENT USER 
   ✔ Uses /api/auth/me (NOT /api/users/me)
   ⭐ CORRECTION: Clear session on failure to stop "jwt expired" loops
===================================================================== */
export const fetchCurrentUser = async () => {
  try {
    const res = await api.get("/api/auth/me");
    return res.data || null;
  } catch (err) {
    // If /api/auth/me fails, it means the token in the header is bad (expired/invalid).
    // The interceptor may have already tried refreshing. 
    // Clear the user to prevent the AuthContext from retrying with the bad token.
    console.warn("fetchCurrentUser failed (token invalid/expired). Clearing local session.");
    clearUser();
    return null;
  }
};

/* =====================================================================
   REFRESH TOKEN — rotates refresh token automatically
===================================================================== */
export const refreshToken = async () => {
  try {
    const res = await api.post(
      "/api/auth/refresh",
      {},
      { withCredentials: true }
    );

    const backendUser = res.data?.user;
    const token = res.data?.accessToken;

    return normalizeUser(backendUser, token);
  } catch {
    return null;
  }
};

/* =====================================================================
   LOGOUT
===================================================================== */
export const logoutUser = async () => {
  try {
    await api.post("/api/auth/logout", {}, { withCredentials: true });
  } catch {
    // not critical
  }

  clearUser();
};