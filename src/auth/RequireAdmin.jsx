// src/auth/RequireAdmin.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/" state={{ from: location }} replace />;

  if (user.role !== "Admin" && user.role !== "SuperAdmin")
    return <Navigate to="/dashboard" replace />;

  return children;
}
