// src/services/patientService.js
import api from "../api/api";

// CREATE PATIENT
export const createPatient = async (payload) => {
  const res = await api.post("/patients", payload);
  return res.data;
};

// GET ALL PATIENTS
export const getPatients = async () => {
  const res = await api.get("/patients");
  return res.data;
};

export const getAllPatients = getPatients;

// GET SINGLE PATIENT
export const getPatient = async (id) => {
  const res = await api.get(`/patients/${id}`);
  return res.data;
};

// ADD MEDICAL NOTE
export const addPatientNote = async (patientId, note) => {
  const res = await api.post(`/patients/${patientId}/notes`, { note });
  return res.data;
};

// ASSIGNED PATIENTS (Doctor only)
export const getMyPatients = async () => {
  const res = await api.get("/patients?assignedTo=me");
  return res.data;
};

// UPDATE PATIENT
export const updatePatient = async (id, payload) => {
  const res = await api.put(`/patients/${id}`, payload);
  return res.data;
};

// DELETE PATIENT
export const deletePatient = async (id) => {
  const res = await api.delete(`/patients/${id}`);
  return res.data;
};
