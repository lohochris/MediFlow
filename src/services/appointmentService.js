// src/services/appointmentService.js
import api from "../api/api";

/* ============================================================
   NORMALIZER – ensure consistent shape for frontend components
============================================================ */
const normalize = (appt) => {
  if (!appt) return {};

  return {
    ...appt,
    id: appt.id || appt._id,

    patient: appt.patient
      ? {
          ...appt.patient,
          id: appt.patient.id || appt.patient._id,
        }
      : null,

    doctor: appt.doctor
      ? {
          ...appt.doctor,
          id: appt.doctor.id || appt.doctor._id,
        }
      : null,
  };
};

/* ============================================================
   CREATE APPOINTMENT → POST /api/appointments
============================================================ */
export const createAppointment = async (payload) => {
  try {
    const res = await api.post("/api/appointments", {
      patientId: payload.patientId || payload.patient,
      date: payload.date,
      time: payload.time,
      type: payload.type,
      doctorId: payload.doctorId || null,
    });

    return normalize(res.data);
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to create appointment");
  }
};

/* ============================================================
   GET ALL APPOINTMENTS → GET /api/appointments
============================================================ */
export const getAppointments = async () => {
  try {
    const res = await api.get("/api/appointments");

    return Array.isArray(res.data)
      ? res.data.map((a) => normalize(a))
      : [];
  } catch (err) {
    throw new Error("Failed to load appointments");
  }
};

export const getAllAppointments = getAppointments;

/* ============================================================
   GET DOCTOR TODAY APPOINTMENTS → GET /api/doctor/appointments/today
============================================================ */
export const getDoctorAppointments = async () => {
  try {
    const res = await api.get("/api/doctor/appointments/today");

    return Array.isArray(res.data)
      ? res.data.map((a) => normalize(a))
      : [];
  } catch (err) {
    throw new Error("Failed to load doctor appointments");
  }
};

/* ============================================================
   UPDATE APPOINTMENT → PUT /api/appointments/:id
============================================================ */
export const updateAppointment = async (id, payload) => {
  try {
    const res = await api.put(`/api/appointments/${id}`, {
      ...payload,
      patientId: payload.patientId || payload.patient,
      doctorId: payload.doctorId || payload.doctor,
    });

    return normalize(res.data);
  } catch (err) {
    throw new Error("Failed to update appointment");
  }
};

/* ============================================================
   UPDATE STATUS ONLY → PUT /api/appointments/:id
============================================================ */
export const updateAppointmentStatus = async (id, status) => {
  try {
    const res = await api.put(`/api/appointments/${id}`, { status });

    return normalize(res.data);
  } catch (err) {
    throw new Error("Failed to update status");
  }
};

/* ============================================================
   DELETE APPOINTMENT → DELETE /api/appointments/:id
============================================================ */
export const deleteAppointment = async (id) => {
  try {
    const res = await api.delete(`/api/appointments/${id}`);
    return res.data;
  } catch (err) {
    throw new Error("Failed to delete appointment");
  }
};
