// src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser as loadStoredUser,
  saveUser,
  clearUser,
  fetchCurrentUser,  // ✓ uses /api/auth/me
} from "../services/authService";

import api from "../api/api";

const AuthContext = createContext();

/* ============================================================
   AUTH PROVIDER COMPONENT
============================================================ */
export function AuthProvider({ children }) { 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ============================================================
    NORMALIZE USER
  ============================================================ */
  const normalizeUser = (backendUser, accessToken) => {
    if (!backendUser) return null;

    return {
      ...backendUser,
      accessToken,
      patientId:
        backendUser.patientId ??
        backendUser.patientProfile?._id ??
        null,
      // patientProfile now includes the critical isProfileComplete status
      patientProfile: backendUser.patientProfile ?? null,
      name: backendUser.name ?? "User",
    };
  };

  /* ============================================================
    INITIAL SESSION SYNC
  ============================================================ */
  useEffect(() => {
    async function init() {
      const stored = loadStoredUser();

      if (stored) {
        setUser(stored); 
        
        try {
          const latest = await fetchCurrentUser(); 

          if (latest) {
            const finalUser = normalizeUser(latest, stored.accessToken); 
            saveUser(finalUser);
            setUser(finalUser);
          } else {
            throw new Error("Initial sync failed.");
          }
        } catch (err) {
          console.error("🔻 Initial session sync failed — clearing session:", err);
          clearUser();
          setUser(null);
        }
      }

      setLoading(false);
    }

    init();
  }, []);

  /* ============================================================
    LOGIN
  ============================================================ */
  const login = (finalUser) => {
    saveUser(finalUser);
    setUser(finalUser);
  };

  /* ============================================================
    LOGOUT
  ============================================================ */
  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.warn("Logout warning:", err);
    }

    clearUser();
    setUser(null);
  };

  /* ============================================================
    RELOAD USER — (Guarantees profile update synchronization)
    ⭐ We will use this function in the CompleteProfile component.
  ============================================================ */
  const reloadUser = async () => {
    try {
      const backendUser = await fetchCurrentUser();
      if (!backendUser) return null;

      const stored = loadStoredUser();
      const token = stored?.accessToken;

      const final = normalizeUser(backendUser, token);
      
      saveUser(final); 

      // Use functional update for reliable state synchronization
      setUser(prevUser => {
        return final;
      });
      
      return final;
    } catch (err) {
      console.error("reloadUser error:", err);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        // ⭐ EXPOSE reloadUser for profile update synchronization
        reloadUser, 
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ============================================================
   USE AUTH HOOK
============================================================ */
export function useAuth() { 
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}