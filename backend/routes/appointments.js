// backend/routes/appointments.js
import express from "express";
import Appointment from "../models/Appointment.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================
   CREATE NEW APPOINTMENT (PUBLIC BOOKING)
   POST /appointments
============================================================ */
router.post("/", async (req, res) => {
  try {
    const { patientId, date, time, type, doctorId } = req.body;

    if (!patientId || !date || !time || !type) {
      return res.status(400).json({
        error: "Patient ID, type, date, and time are required.",
      });
    }

    const appt = await Appointment.create({
      patient: patientId,
      date,
      time,
      type,
      doctor: doctorId || null,
      status: "pending",
    });

    return res.status(201).json(appt);
  } catch (err) {
    console.error("POST /appointments ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   GET ALL APPOINTMENTS (ADMIN ONLY)
   GET /appointments
============================================================ */
router.get("/", requireAuth, async (req, res) => {
  try {
    const appts = await Appointment.find()
      .populate("patient")
      .populate("doctor")
      .sort({ date: 1, time: 1 });

    return res.json(appts);
  } catch (err) {
    console.error("GET /appointments ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   GET DOCTOR'S APPOINTMENTS
   GET /appointments/my
============================================================ */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const appts = await Appointment.find({
      doctor: req.user._id,
    })
      .populate("patient")
      .sort({ date: 1, time: 1 });

    return res.json(appts);
  } catch (err) {
    console.error("GET /appointments/my ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   UPDATE APPOINTMENT
   PUT /appointments/:id
============================================================ */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const updateBody = { ...req.body };

    if (req.body.patientId) {
      updateBody.patient = req.body.patientId;
      delete updateBody.patientId;
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateBody,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("PUT /appointments/:id ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   DELETE APPOINTMENT
   DELETE /appointments/:id
============================================================ */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.json({ message: "Appointment deleted" });
  } catch (err) {
    console.error("DELETE /appointments/:id ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
