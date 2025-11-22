// src/services/patientService.js
import api from "../api/api";

/* ============================================================
   NORMALIZER — Ensures consistent shape for React components
============================================================ */
const normalize = (p) => {
  if (!p) return null;

  return {
    ...p,
    id: p.id || p._id,

    // Ensure nested arrays also have normalized IDs
    medicalNotes: Array.isArray(p.medicalNotes)
      ? p.medicalNotes.map((n) => ({
          ...n,
          id: n.id || n._id,
        }))
      : [],

    vitals: Array.isArray(p.vitals)
      ? p.vitals.map((v) => ({ ...v, id: v.id || v._id }))
      : [],

    diagnoses: Array.isArray(p.diagnoses)
      ? p.diagnoses.map((d) => ({ ...d, id: d.id || d._id }))
      : [],

    prescriptions: Array.isArray(p.prescriptions)
      ? p.prescriptions.map((rx) => ({ ...rx, id: rx.id || rx._id }))
      : [],

    labs: Array.isArray(p.labs)
      ? p.labs.map((l) => ({ ...l, id: l.id || l._id }))
      : [],

    visits: Array.isArray(p.visits)
      ? p.visits.map((v) => ({ ...v, id: v.id || v._id }))
      : [],
  };
};

/* ============================================================
   CREATE PATIENT — POST /api/patients
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
   GET ALL PATIENTS — GET /api/patients
============================================================ */
export const getPatients = async () => {
  try {
    const res = await api.get("/api/patients");
    return Array.isArray(res.data) ? res.data.map(normalize) : [];
  } catch (err) {
    throw new Error("Failed to load patients");
  }
};

export const getAllPatients = getPatients;

/* ============================================================
   GET SINGLE PATIENT — GET /api/patients/:id
============================================================ */
export const getPatient = async (id) => {
  if (!id) throw new Error("Patient ID is required");

  try {
    const res = await api.get(`/api/patients/${id}`);
    return normalize(res.data);
  } catch (err) {
    throw new Error("Failed to load patient details");
  }
};

/* ============================================================
   ADD NOTE — POST /api/patients/:id/notes
============================================================ */
export const addPatientNote = async (patientId, note) => {
  if (!patientId) throw new Error("patientId missing");
  if (!note) throw new Error("note text missing");

  try {
    const res = await api.post(`/api/patients/${patientId}/notes`, { note });
    return Array.isArray(res.data) ? res.data.map(normalize) : normalize(res.data);
  } catch (err) {
    throw new Error("Failed to add note");
  }
};

/* ============================================================
   GET DOCTOR’S ASSIGNED PATIENTS — /api/patients?assignedTo=me
============================================================ */
export const getMyPatients = async () => {
  try {
    const res = await api.get("/api/patients?assignedTo=me");
    return Array.isArray(res.data) ? res.data.map(normalize) : [];
  } catch (err) {
    throw new Error("Failed to load doctor's patients");
  }
};

/* ============================================================
   UPDATE PATIENT — PUT /api/patients/:id
============================================================ */
export const updatePatient = async (id, payload) => {
  if (!id) throw new Error("Patient ID is required");

  try {
    const res = await api.put(`/api/patients/${id}`, payload);
    return normalize(res.data);
  } catch (err) {
    throw new Error("Failed to update patient");
  }
};

/* ============================================================
   DELETE PATIENT — DELETE /api/patients/:id
============================================================ */
export const deletePatient = async (id) => {
  if (!id) throw new Error("Patient ID required");

  try {
    const res = await api.delete(`/api/patients/${id}`);
    return res.data;
  } catch (err) {
    throw new Error("Failed to delete patient");
  }
};

/* ============================================================
   FILE MANAGEMENT (UPLOAD / GET / DELETE)
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
  } catch (err) {
    throw new Error("File upload failed");
  }
};

export const getPatientFiles = async (id) => {
  if (!id) throw new Error("Patient ID required");

  try {
    const res = await api.get(`/api/patients/${id}/files`);
    return res.data;
  } catch (err) {
    throw new Error("Failed to load files");
  }
};

export const deletePatientFile = async (id, fileId) => {
  if (!id || !fileId) throw new Error("Both patient ID & file ID required");

  try {
    const res = await api.delete(`/api/patients/${id}/files/${fileId}`);
    return res.data;
  } catch (err) {
    throw new Error("Failed to delete file");
  }
};
