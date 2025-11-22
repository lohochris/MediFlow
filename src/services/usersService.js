// src/services/usersService.js
import api from "../api/api";

/* ============================================================
   USERS SERVICE — Standardized to /api/users/*
============================================================ */

/* ---------------------- GET ALL USERS ------------------------ */
// GET /api/users
export const getUsers = async () => {
  const res = await api.get("/api/users");
  return res.data;
};

/* ---------------------- GET SINGLE USER ---------------------- */
// GET /api/users/:id
export const getUser = async (id) => {
  if (!id) throw new Error("User ID required");

  const res = await api.get(`/api/users/${id}`);
  return res.data;
};

/* ---------------------- CREATE USER -------------------------- */
// POST /api/users
export const createUser = async (payload) => {
  const res = await api.post("/api/users", payload);
  return res.data;
};

/* ---------------------- UPDATE USER -------------------------- */
// PUT /api/users/:id
export const updateUser = async (id, payload) => {
  if (!id) throw new Error("User ID required");

  const res = await api.put(`/api/users/${id}`, payload);
  return res.data;
};

/* ---------------------- DELETE USER -------------------------- */
// DELETE /api/users/:id
export const deleteUser = async (id) => {
  if (!id) throw new Error("User ID required");

  const res = await api.delete(`/api/users/${id}`);
  return res.data;
};

/* ---------------------- UPDATE ROLE -------------------------- */
// PUT /api/users/:id/role
export const updateUserRole = async (id, role) => {
  if (!id) throw new Error("User ID required");

  const res = await api.put(`/api/users/${id}/role`, { role });
  return res.data;
};
