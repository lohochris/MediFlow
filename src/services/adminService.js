// src/services/adminService.js
import api from "../api/api";

/* ============================================================
   ADMIN SERVICE — KPIs, Logs, Reports, Export
   Backend Routes Covered:
   ✔ /api/admin/*
   ✔ /api/admin/reports/*
   ✔ /api/admin/export/*
============================================================ */

/* ------------------------------------------------------------
   ADMIN KPIs
   GET /api/admin/kpis
------------------------------------------------------------ */
export async function getAdminKPIs() {
  const res = await api.get("/api/admin/kpis", { withCredentials: true });
  return res.data ?? {};
}

/* ------------------------------------------------------------
   ACTIVITY LOG
   GET /api/admin/activity?limit=50
------------------------------------------------------------ */
export async function getAdminActivity(limit = 50) {
  const res = await api.get(`/api/admin/activity?limit=${limit}`, {
    withCredentials: true,
  });

  return Array.isArray(res.data) ? res.data : [];
}

/* ------------------------------------------------------------
   SYSTEM METRICS
   GET /api/admin/system-stats
------------------------------------------------------------ */
export async function getSystemStats() {
  const res = await api.get("/api/admin/system-stats", {
    withCredentials: true,
  });

  return res.data ?? {};
}

/* ------------------------------------------------------------
   REPORTS (Users, Appointments)
------------------------------------------------------------ */

// USERS REPORT — GET /api/admin/reports/users
export async function getUserReport() {
  const res = await api.get("/api/admin/reports/users", {
    withCredentials: true,
  });

  return Array.isArray(res.data) ? res.data : [];
}

// APPOINTMENTS REPORT — GET /api/admin/reports/appointments
export async function getAppointmentReport() {
  const res = await api.get("/api/admin/reports/appointments", {
    withCredentials: true,
  });

  return Array.isArray(res.data) ? res.data : [];
}

/* ------------------------------------------------------------
   EXPORT DATA
   GET /api/admin/export?format=csv|pdf
------------------------------------------------------------ */
export async function exportAdminData(format = "csv") {
  const res = await api.get(`/api/admin/export?format=${format}`, {
    responseType: "blob",
    withCredentials: true,
  });

  return res.data; // Blob file (CSV or PDF)
}
