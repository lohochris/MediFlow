// src/auth/RequireAuth.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../services/authService";

export default function RequireAuth({ children }) {
  const { user, loading, setUser, reloadUser } = useAuth();
  const location = useLocation();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      // STEP 1 — user already exists
      if (user) {
        setChecking(false);
        return;
      }

      // STEP 2 — Local storage user
      const stored = getCurrentUser();
      if (stored?.accessToken) {
        const fresh = await reloadUser();

        if (fresh) {
          setChecking(false);
          return;
        }
      }

      // STEP 3 — No session
      setChecking(false);
    }

    check();
  }, [user, reloadUser, setUser]);

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
