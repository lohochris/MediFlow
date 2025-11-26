// src/auth/RequireAdmin.jsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../services/authService";

export default function RequireAdmin({ children }) {
  const { user, loading, reloadUser } = useAuth();
  const location = useLocation();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifySession() {
      // 1️⃣ Already authenticated in AuthContext
      if (user) {
        setChecking(false);
        return;
      }

      // 2️⃣ Try restoring from localStorage
      const stored = getCurrentUser();

      if (stored?.accessToken) {
        const refreshed = await reloadUser();
        if (refreshed) {
          setChecking(false);
          return;
        }
      }

      // 3️⃣ No valid session
      setChecking(false);
    }

    verifySession();
  }, [user, reloadUser]);

  /* -------------------------------------------------------------------------
     SHOW LOADING WHILE:
     - Restoring user session
     - Refreshing token
     - Syncing from backend
  ------------------------------------------------------------------------- */
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  /* -------------------------------------------------------------------------
     NOT LOGGED IN → Redirect to login
  ------------------------------------------------------------------------- */
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  /* -------------------------------------------------------------------------
     ROLE CHECK → Admin & SuperAdmin ONLY
  ------------------------------------------------------------------------- */
  if (user.role !== "Admin" && user.role !== "SuperAdmin") {
    return <Navigate to="/dashboard" replace />;
  }

  /* -------------------------------------------------------------------------
     Authorized → Allow access
  ------------------------------------------------------------------------- */
  return children;
}
