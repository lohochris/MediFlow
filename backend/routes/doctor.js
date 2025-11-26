// backend/routes/doctor.js (Use this version to ensure consistency)

import express from "express";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
// Use the exact names exported at the end of auth.js
import { requireAuth, requireRole } from "../middleware/auth.js"; 

const router = express.Router();

// GET /doctor/appointments/today (Failing around here at line 12)
router.get("/appointments/today", requireAuth, requireRole("Doctor"), async (req, res) => {
  try {
    const today = new Date().toISOString().substring(0, 10);

    const appointments = await Appointment.find({
      doctor: req.user._id, 
      date: today,
    })
      .populate("patient", "name email phone")
      .sort({ time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error("GET appointments/today ERROR:", error);
    res.status(500).json({ error: "Failed to fetch today's appointments." });
  }
});

// GET /doctor/patients
router.get("/patients", requireAuth, requireRole("Doctor"), async (req, res) => {
  try {
    const patients = await Patient.find({
      assignedDoctor: req.user._id,
    });

    res.json(patients);
  } catch (error) {
    console.error("GET patients ERROR:", error);
    res.status(500).json({ error: "Failed to fetch assigned patients." });
  }
});

// POST /doctor/patients/:id/note
router.post("/patients/:id/note", requireAuth, requireRole("Doctor"), async (req, res) => {
  try {
    const { note } = req.body;
    const patientId = req.params.id;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    patient.medicalNotes.push({
      doctor: req.user._id,
      note,
    });

    await patient.save();
    
    const newNote = patient.medicalNotes[patient.medicalNotes.length - 1];

    res.json({ 
      message: "Note added successfully", 
      newNote: newNote,
      patientId: patient._id
    });
  } catch (error) {
    console.error("POST patient note ERROR:", error);
    res.status(500).json({ error: "Failed to add medical note." });
  }
});

export default router;