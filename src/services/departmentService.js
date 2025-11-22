// src/services/departmentService.js
import api from "../api/api";

/* ============================================================
   DEPARTMENT SERVICE — Consistent with /api/departments/*
============================================================ */

/* ----------------------- GET ALL --------------------------- */
export async function getAllDepartments() {
  try {
    const res = await api.get("/api/departments");
    return res.data;
  } catch (err) {
    throw new Error("Failed to load departments");
  }
}

/* ----------------------- CREATE ----------------------------- */
export async function createDepartment(payload) {
  try {
    const res = await api.post("/api/departments", payload);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to create department");
  }
}

/* ----------------------- UPDATE ----------------------------- */
export async function updateDepartment(id, payload) {
  if (!id) throw new Error("Department ID is required");

  try {
    const res = await api.put(`/api/departments/${id}`, payload);
    return res.data;
  } catch (err) {
    throw new Error("Failed to update department");
  }
}

/* ----------------------- DELETE ----------------------------- */
export async function deleteDepartment(id) {
  if (!id) throw new Error("Department ID is required");

  try {
    const res = await api.delete(`/api/departments/${id}`);
    return res.data;
  } catch (err) {
    throw new Error("Failed to delete department");
  }
}
