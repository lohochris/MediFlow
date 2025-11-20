// src/services/appointmentService.js
import api from "../api/api";

/* ============================================================
   CREATE APPOINTMENT
   Works for both PUBLIC and ADMIN
   Backend expects: patientId, date, time, type
============================================================ */
export const createAppointment = async (payload) => {
  const res = await api.post("/appointments", {
    patientId: payload.patientId || payload.patient, // unified field
    date: payload.date,
    time: payload.time,
    type: payload.type,
    doctorId: payload.doctorId || null,  // optional
  });

  return res.data;
};

/* ============================================================
   GET ALL APPOINTMENTS (Admin)
============================================================ */
export const getAppointments = async () => {
  const res = await api.get("/appointments");
  return res.data;
};

export const getAllAppointments = getAppointments;

/* ============================================================
   GET DOCTOR APPOINTMENTS (Doctor only)
============================================================ */
export const getDoctorAppointments = async () => {
  const res = await api.get("/appointments/my");
  return res.data;
};

/* ============================================================
   UPDATE APPOINTMENT
   Accepts patientId or patient (normalized)
============================================================ */
export const updateAppointment = async (id, payload) => {
  const res = await api.put(`/appointments/${id}`, {
    patientId: payload.patientId || payload.patient, // unified
    date: payload.date,
    time: payload.time,
    type: payload.type,
    doctorId: payload.doctorId || null,
  });

  return res.data;
};

/* ============================================================
   UPDATE STATUS: pending / completed / cancelled
============================================================ */
export const updateAppointmentStatus = async (id, status) => {
  const res = await api.put(`/appointments/${id}/status`, { status });
  return res.data;
};

/* ============================================================
   DELETE APPOINTMENT
============================================================ */
export const deleteAppointment = async (id) => {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
};
