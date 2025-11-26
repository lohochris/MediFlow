// src/auth/RequirePatient.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../services/authService";

export default function RequirePatient({ children }) {
  const { user, loading, reloadUser } = useAuth();
  const location = useLocation();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verify() {
      // 1️⃣ If user already loaded in context → proceed
      if (user) {
        setChecking(false);
        return;
      }

      // 2️⃣ Try restore from localStorage
      const stored = getCurrentUser();

      if (stored?.accessToken) {
        const refreshed = await reloadUser(); // hits /api/auth/me
        if (refreshed) {
          setChecking(false);
          return;
        }
      }

      // 3️⃣ No session
      setChecking(false);
    }

    verify();
  }, [user, reloadUser]);

  /* ----------------------------------------------------
     Show loader during session restore
  ---------------------------------------------------- */
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  /* ----------------------------------------------------
     Not authenticated → Login
  ---------------------------------------------------- */
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  /* ----------------------------------------------------
     NOT a Patient → fallback to dashboard
  ---------------------------------------------------- */
  if (user.role !== "Patient") {
    return <Navigate to="/dashboard" replace />;
  }

  /* ----------------------------------------------------
     Authorized → render Patient page
  ---------------------------------------------------- */
  return children;
}
