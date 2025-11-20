// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser as getStoredUser,
  saveUser,
  clearUser,
  fetchCurrentUser,
} from "../services/authService";
import api from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // INITIAL LOAD (app startup)
  // ==========================================================
  useEffect(() => {
    async function init() {
      const stored = getStoredUser();

      if (stored?.accessToken) {
        // Prevent screen flicker
        setUser(stored);

        try {
          // Attempt silent refresh
          const refresh = await api.post(
            "/auth/refresh",
            {},
            { withCredentials: true }
          );

          const newToken = refresh.data?.accessToken;

          if (newToken) {
            // Fetch fully fresh profile (with correct role)
            const fresh = await fetchCurrentUser();

            if (fresh) {
              const final = { ...fresh, accessToken: newToken };
              saveUser(final);
              setUser(final);
            }
          }
        } catch (err) {
          clearUser();
          setUser(null);
        }
      }

      setLoading(false);
    }

    init();
  }, []);

  // ==========================================================
  // LOGIN (from Login.jsx or Register.jsx)
  // login(userObj) must receive full object: { user, accessToken }
  // ==========================================================
  const login = (userObj) => {
    saveUser(userObj);
    setUser(userObj);
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearUser();
    setUser(null);
  };

  // ==========================================================
  // RELOAD USER (used after Google OAuth redirect)
  // ==========================================================
  const reloadUser = async () => {
    try {
      const fresh = await fetchCurrentUser();
      if (!fresh) return null;

      const stored = getStoredUser();
      const token = stored?.accessToken;

      const finalUser = { ...fresh, accessToken: token };

      saveUser(finalUser);
      setUser(finalUser);

      return finalUser;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        reloadUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
