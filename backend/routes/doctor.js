import express from "express";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /doctor/appointments/today
router.get("/appointments/today", requireAuth, requireRole("Doctor"), async (req, res) => {
  const today = new Date().toISOString().substring(0, 10);

  const appointments = await Appointment.find({
    doctor: req.user._id,
    date: today,
  })
    .populate("patient", "name email phone")
    .sort({ time: 1 });

  res.json(appointments);
});

// GET /doctor/patients
router.get("/patients", requireAuth, requireRole("Doctor"), async (req, res) => {
  const patients = await Patient.find({
    assignedDoctor: req.user._id,
  });

  res.json(patients);
});

// POST /doctor/patients/:id/note
router.post("/patients/:id/note", requireAuth, requireRole("Doctor"), async (req, res) => {
  const { note } = req.body;
  const patientId = req.params.id;

  const patient = await Patient.findById(patientId);
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  patient.medicalNotes.push({
    doctor: req.user._id,
    note,
  });

  await patient.save();

  res.json({ message: "Note added", notes: patient.medicalNotes });
});

export default router;
