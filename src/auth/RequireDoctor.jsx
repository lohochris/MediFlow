// src/auth/RequireDoctor.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../services/authService";

export default function RequireDoctor({ children }) {
  const { user, loading, reloadUser } = useAuth();
  const location = useLocation();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      // 1️⃣ User already authenticated in context
      if (user) {
        setChecking(false);
        return;
      }

      // 2️⃣ Check for existing session in localStorage
      const stored = getCurrentUser();

      if (stored?.accessToken) {
        const refreshed = await reloadUser(); // hits /api/auth/me
        if (refreshed) {
          setChecking(false);
          return;
        }
      }

      // 3️⃣ No active session
      setChecking(false);
    }

    verify();
  }, [user, reloadUser]);

  /* -------------------------------------------------------
     DISPLAY LOADER WHILE RESTORING SESSION
  -------------------------------------------------------- */
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  /* -------------------------------------------------------
     NOT LOGGED IN → Redirect to Login
  -------------------------------------------------------- */
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  /* -------------------------------------------------------
     AUTHORIZATION CHECK — DOCTORS ONLY
  -------------------------------------------------------- */
  if (user.role !== "Doctor") {
    return <Navigate to="/dashboard" replace />;
  }

  /* -------------------------------------------------------
     AUTHORIZED → ALLOW ACCESS
  -------------------------------------------------------- */
  return children;
}
