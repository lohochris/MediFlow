// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
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
  // INITIAL LOAD (on app startup)
  // ==========================================================
  useEffect(() => {
    async function init() {
      const stored = getStoredUser();

      if (stored?.accessToken) {
        setUser(stored);

        try {
          // CALL CORRECT REFRESH ENDPOINT
          const refresh = await api.post("/api/auth/refresh", {}, { withCredentials: true });
          const newToken = refresh.data?.accessToken;

          if (newToken) {
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
  // LOGIN
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
      // CORRECT LOGOUT ENDPOINT
      await api.post("/api/auth/logout", {}, { withCredentials: true });
    } catch {}
    clearUser();
    setUser(null);
  };

  // ==========================================================
  // FORCE RELOAD USER AFTER GOOGLE LOGIN
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
