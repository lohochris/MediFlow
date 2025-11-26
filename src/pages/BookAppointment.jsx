// src/pages/BookAppointment.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { createPublicPatient } from "../services/patientService";
import { createAppointment } from "../services/appointmentService";
import { getCurrentUser } from "../services/authService";

export default function BookAppointment() {
  const navigate = useNavigate();

  const user = getCurrentUser();
  const loggedInPatientId = user?.patientId ?? null;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "Male",
    dob: "",
    type: "",
    date: "",
    time: "",
  });

  const [success, setSuccess] = useState(false);
  const [appointmentInfo, setAppointmentInfo] = useState(null);

  /* -------------------------------------------------------------
     SUBMIT APPOINTMENT FORM
  --------------------------------------------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields
    const required = ["name", "phone", "gender", "dob", "type", "date", "time"];
    for (const key of required) {
      if (!form[key] || String(form[key]).trim() === "") {
        toast.error("Please fill all required fields.");
        return;
      }
    }

    try {
      let patientId = loggedInPatientId;

      // ------------------------------------------------------------
      // PUBLIC BOOKING → Create patient in /api/patients/public
      // ------------------------------------------------------------
      if (!patientId) {
        const patient = await createPublicPatient({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email?.trim() || "",
          gender: form.gender,
          dob: form.dob,
        });

        patientId = patient?.id || patient?._id;

        if (!patientId) {
          throw new Error("Server did not return a valid patient ID.");
        }
      }

      // ------------------------------------------------------------
      // CREATE APPOINTMENT
      // ------------------------------------------------------------
      const appt = await createAppointment({
        patientId,
        type: form.type,
        date: form.date,
        time: form.time,
      });

      toast.success("Appointment booked successfully!");

      setAppointmentInfo({
        patient: { ...form },
        appt,
      });

      setSuccess(true);

      // Reset form
      setForm({
        name: "",
        phone: "",
        email: "",
        gender: "Male",
        dob: "",
        type: "",
        date: "",
        time: "",
      });
    } catch (err) {
      console.error("BOOK APPOINTMENT ERROR:", err);
      toast.error(err?.response?.data?.error || "Failed to book appointment.");
    }
  };

  /* -------------------------------------------------------------
     UI
  --------------------------------------------------------------*/
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-6">
      {success && appointmentInfo ? (
        /* -----------------------------------------------------
           SUCCESS PAGE
        ------------------------------------------------------*/
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 p-10 rounded-2xl max-w-lg w-full shadow-xl text-center"
        >
          <h2 className="text-2xl font-semibold text-emerald-600">
            Appointment Confirmed
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Confirmation sent via Email & SMS (simulated).
          </p>

          <div className="mt-6 text-left space-y-2">
            <div><strong>Patient:</strong> {appointmentInfo.patient.name}</div>
            <div><strong>Phone:</strong> {appointmentInfo.patient.phone}</div>
            <div><strong>Type:</strong> {appointmentInfo.appt.type}</div>
            <div><strong>Date:</strong> {appointmentInfo.appt.date}</div>
            <div><strong>Time:</strong> {appointmentInfo.appt.time}</div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg"
            >
              Go to Login
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-2 border border-emerald-600 text-emerald-600 rounded-lg"
            >
              Dashboard
            </button>

            <button
              onClick={() => {
                setSuccess(false);
                setAppointmentInfo(null);
              }}
              className="text-sm text-slate-500"
            >
              Book another appointment
            </button>
          </div>
        </motion.div>
      ) : (
        /* -----------------------------------------------------
           BOOKING FORM
        ------------------------------------------------------*/
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-lg shadow-xl"
        >
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-600 dark:text-slate-300 mb-4 hover:underline"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Book Appointment
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">

            {/* NAME */}
            <div>
              <label className="block text-sm mb-1">Full Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm mb-1">Phone *</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm mb-1">Email (optional)</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm mb-1">Date of Birth *</label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700"
              />
            </div>

            {/* GENDER */}
            <div>
              <label className="block text-sm mb-1">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            {/* APPOINTMENT TYPE */}
            <div>
              <label className="block text-sm mb-1">Appointment Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700"
              >
                <option value="">Select type</option>
                <option>Consultation</option>
                <option>General Checkup</option>
                <option>Dental</option>
                <option>Eye Check</option>
                <option>Emergency</option>
              </select>
            </div>

            {/* DATE + TIME */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Time *</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-lg shadow-sm hover:bg-emerald-700 transition"
            >
              Book Appointment
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
