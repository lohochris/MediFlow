// src/services/notificationService.js
import api from "../api/api";

/* ============================================================
   NOTIFICATION SERVICE — User & Admin Notifications
   Backend routes:
   ✔ /api/notifications/*
   ✔ /api/admin/notifications/*
   ✔ /api/notify/send
============================================================ */

/* ------------------------------------------------------------
   USER NOTIFICATIONS
------------------------------------------------------------ */

// GET /api/notifications
export async function getUserNotifications() {
  const res = await api.get("/api/notifications");
  return Array.isArray(res.data) ? res.data : [];
}

// PATCH /api/notifications/:id/read
export async function markNotificationRead(id) {
  const res = await api.patch(`/api/notifications/${id}/read`);
  return res.data;
}

// DELETE /api/notifications/:id
export async function deleteNotification(id) {
  const res = await api.delete(`/api/notifications/${id}`);
  return res.data;
}

/* ------------------------------------------------------------
   ADMIN NOTIFICATIONS
------------------------------------------------------------ */

// GET /api/admin/notifications
export async function getAdminNotifications() {
  const res = await api.get("/api/admin/notifications");
  return Array.isArray(res.data) ? res.data : [];
}

// PATCH /api/admin/notifications/:id/read
export async function markAdminNotificationRead(id) {
  const res = await api.patch(`/api/admin/notifications/${id}/read`);
  return res.data;
}

/* ------------------------------------------------------------
   SEND NOTIFICATION (Admin → System-wide broadcast)
------------------------------------------------------------ */

// POST /api/notify/send
export async function sendNotification(payload) {
  const res = await api.post("/api/notify/send", payload);
  return res.data;
}
