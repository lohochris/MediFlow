// src/services/doctorService.js
import api from "../api/api";

/* ============================================================
   DOCTOR SERVICE — Doctor Dashboard Only (No CRUD)
   Matches backend:
   /api/doctor/appointments/today
   /api/doctor/patients
   /api/doctor/patients/:id/note
============================================================ */

/* ------------------ GET TODAY'S APPOINTMENTS ------------------ */
// GET /api/doctor/appointments/today
export const getTodayAppointments = async () => {
  const res = await api.get("/api/doctor/appointments/today");
  return res.data;
};

/* ------------------ GET DOCTOR'S PATIENTS --------------------- */
// GET /api/doctor/patients
export const getDoctorPatients = async () => {
  const res = await api.get("/api/doctor/patients");
  return res.data;
};

/* ------------------ ADD NOTE TO A PATIENT --------------------- */
// POST /api/doctor/patients/:id/note
export const addDoctorNote = async (patientId, note) => {
  if (!patientId) throw new Error("Patient ID is required");
  if (!note) throw new Error("Note is required");

  const res = await api.post(`/api/doctor/patients/${patientId}/note`, {
    note,
  });

  return res.data;
};
