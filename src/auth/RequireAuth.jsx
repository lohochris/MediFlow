// src/auth/RequireAuth.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../services/authService";

export default function RequireAuth({ children }) {
  const { user, loading, setUser, getCurrentUser: fetchUser } = useAuth();
  const location = useLocation();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      // STEP 1 — If user already exists in context → allow
      if (user) {
        setChecking(false);
        return;
      }

      // STEP 2 — If a user exists in localStorage → fetch full profile
      const stored = getCurrentUser();
      if (stored?.accessToken) {
        const profile = await fetchUser(); // GET /users/me
        if (profile) {
          setUser({ ...profile, accessToken: stored.accessToken });
          setChecking(false);
          return;
        }
      }

      // STEP 3 — No session
      setChecking(false);
    }

    check();
  }, [user, fetchUser, setUser]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
