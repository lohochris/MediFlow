// src/services/appointmentService.js
import api from "../api/api";

/* ============================================================
   NORMALIZER – consistent appointment structure
============================================================ */
const normalize = (appt) => {
  if (!appt) return null;

  const normalizeEntity = (e) =>
    e
      ? {
          ...e,
          id: e.id || e._id,
        }
      : null;

  return {
    ...appt,

    id: appt.id || appt._id,

    patient: normalizeEntity(appt.patient),
    doctor: normalizeEntity(appt.doctor),
  };
};

/* ============================================================
   CREATE APPOINTMENT — POST /api/appointments
   Works for:
     ✔ Public Booking
     ✔ Logged-in Patients
     ✔ Doctor/Admin/SuperAdmin
============================================================ */
export const createAppointment = async (payload) => {
  try {
    const res = await api.post("/api/appointments", {
      patient: payload.patientId || payload.patient,
      doctor: payload.doctorId || payload.doctor || null,
      date: payload.date,
      time: payload.time,
      type: payload.type,
    });

    return normalize(res.data);
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Failed to create appointment"
    );
  }
};

/* ============================================================
   GET APPOINTMENTS — GET /api/appointments
   Role-Based Filtering (handled by backend)
============================================================ */
export const getAppointments = async () => {
  try {
    const res = await api.get("/api/appointments");
    return Array.isArray(res.data) ? res.data.map(normalize) : [];
  } catch {
    throw new Error("Failed to load appointments");
  }
};

export const getAllAppointments = getAppointments;

/* ============================================================
   GET DOCTOR TODAY APPOINTMENTS — GET /api/doctor/appointments/today
============================================================ */
export const getDoctorAppointments = async () => {
  try {
    const res = await api.get("/api/doctor/appointments/today");
    return Array.isArray(res.data) ? res.data.map(normalize) : [];
  } catch {
    throw new Error("Failed to load doctor appointments");
  }
};

/* ============================================================
   UPDATE APPOINTMENT — PUT /api/appointments/:id
============================================================ */
export const updateAppointment = async (id, payload) => {
  try {
    const res = await api.put(`/api/appointments/${id}`, {
      patient: payload.patientId || payload.patient,
      doctor: payload.doctorId || payload.doctor,
      date: payload.date,
      time: payload.time,
      type: payload.type,
      status: payload.status, // optional
    });

    return normalize(res.data);
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Failed to update appointment"
    );
  }
};

/* ============================================================
   UPDATE STATUS — PUT /api/appointments/:id (status only)
============================================================ */
export const updateAppointmentStatus = async (id, status) => {
  try {
    const res = await api.put(`/api/appointments/${id}`, { status });
    return normalize(res.data);
  } catch {
    throw new Error("Failed to update appointment status");
  }
};

/* ============================================================
   DELETE APPOINTMENT — DELETE /api/appointments/:id
============================================================ */
export const deleteAppointment = async (id) => {
  try {
    const res = await api.delete(`/api/appointments/${id}`);
    return res.data;
  } catch {
    throw new Error("Failed to delete appointment");
  }
};
