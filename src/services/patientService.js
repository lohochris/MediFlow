// src/services/patientService.js 
import api from "../api/api";

/* ============================================================
   NORMALIZER — Ensures consistent patient shape
============================================================ */
const normalize = (p) => {
  if (!p) return null;

  const normalizeList = (list) =>
    Array.isArray(list)
      ? list.map((item) => ({ ...item, id: item.id || item._id }))
      : [];

  return {
    ...p,
    id: p.id || p._id,

    medicalNotes: normalizeList(p.medicalNotes),
    vitals: normalizeList(p.vitals),
    diagnoses: normalizeList(p.diagnoses),
    prescriptions: normalizeList(p.prescriptions),
    labs: normalizeList(p.labs),
    visits: normalizeList(p.visits),
  };
};

/* ============================================================
   CREATE PATIENT  (Admin / Doctor / SuperAdmin)
============================================================ */
export const createPatient = async (payload) => {
  try {
    const res = await api.post("/api/patients", payload);
    return normalize(res.data);
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to create patient");
  }
};

/* ============================================================
   PUBLIC PATIENT (Guest booking)
============================================================ */
export const createPublicPatient = async (payload) => {
  try {
    const res = await api.post("/api/patients/public", payload);
    return normalize(res.data);
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to create patient");
  }
};

/* ============================================================
   GET ALL PATIENTS
============================================================ */
export const getPatients = async () => {
  try {
    const res = await api.get("/api/patients");
    return res.data?.map(normalize) || [];
  } catch {
    throw new Error("Failed to load patients");
  }
};

export const getAllPatients = getPatients;

/* ============================================================
   GET SINGLE PATIENT
============================================================ */
export const getPatient = async (id) => {
  if (!id) throw new Error("Patient ID is required");

  try {
    const res = await api.get(`/api/patients/${id}`);
    return normalize(res.data);
  } catch {
    throw new Error("Failed to load patient details");
  }
};

/* ============================================================
   ADD NOTE
============================================================ */
export const addPatientNote = async (patientId, note) => {
  if (!patientId) throw new Error("Patient ID required");

  try {
    const res = await api.post(`/api/patients/${patientId}/notes`, { note });
    return normalize(res.data);
  } catch {
    throw new Error("Failed to add note");
  }
};

/* ============================================================
   DOCTOR — MY PATIENTS
============================================================ */
export const getMyPatients = async () => {
  try {
    const res = await api.get("/api/patients?assignedTo=me");
    return res.data?.map(normalize) || [];
  } catch {
    throw new Error("Failed to load doctor's patients");
  }
};

/* ============================================================
   UPDATE ANY PATIENT BY ID (Admin / Doctor / SuperAdmin)
============================================================ */
export const updatePatient = async (id, payload) => {
  if (!id) throw new Error("Patient ID required");

  try {
    const res = await api.put(`/api/patients/${id}`, payload);
    return normalize(res.data);
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to update patient");
  }
};

/* ============================================================
   DELETE PATIENT
============================================================ */
export const deletePatient = async (id) => {
  if (!id) throw new Error("Patient ID required");

  try {
    const res = await api.delete(`/api/patients/${id}`);
    return res.data;
  } catch {
    throw new Error("Failed to delete patient");
  }
};

/* ============================================================
   FILE MANAGEMENT
============================================================ */
export const uploadPatientFile = async (id, file) => {
  if (!id) throw new Error("Patient ID required");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await api.post(`/api/patients/${id}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch {
    throw new Error("File upload failed");
  }
};

export const getPatientFiles = async (id) => {
  if (!id) throw new Error("Patient ID required");

  try {
    const res = await api.get(`/api/patients/${id}/files`);
    return res.data;
  } catch {
    throw new Error("Failed to load files");
  }
};

export const deletePatientFile = async (id, fileId) => {
  if (!id || !fileId)
    throw new Error("Both patient ID & file ID required");

  try {
    const res = await api.delete(`/api/patients/${id}/files/${fileId}`);
    return res.data;
  } catch {
    throw new Error("Failed to delete file");
  }
};

/* ============================================================
   ⭐ UPDATE LOGGED-IN PATIENT PROFILE (Patient Only)
   WORKS WITH BACKEND /api/patients/me
============================================================ */
export const updateMyProfile = async (payload) => {
  try {
    const res = await api.put("/api/patients/me", payload);
    return normalize(res.data);
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to update profile");
  }
};
