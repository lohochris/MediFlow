// src/services/departmentService.js
import api from "../api/api";   // ✅ FIXED: correct axios instance

export async function getAllDepartments() {
  const res = await api.get("/departments");
  return res.data;
}

export async function createDepartment(payload) {
  const res = await api.post("/departments", payload);
  return res.data;
}

export async function updateDepartment(id, payload) {
  const res = await api.put(`/departments/${id}`, payload);
  return res.data;
}

export async function deleteDepartment(id) {
  const res = await api.delete(`/departments/${id}`);
  return res.data;
}
