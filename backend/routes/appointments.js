// backend/routes/appointments.js
import express from "express";
import Appointment from "../models/Appointment.js";
import { requireAuth } from "../middleware/auth.js";
import { withActivity } from "../middleware/withActivity.js";

const router = express.Router();

/* ---------------------------------------------------------
   CREATE APPOINTMENT  — PUBLIC & PATIENTS
--------------------------------------------------------- */
router.post(
  "/",
  withActivity({
    action: "Created Appointment",
    systemUser: "Public",
    getTarget: (req, res, appt) =>
      `Appointment ${appt?._id} for patient ${appt?.patient}`,
    notify: true,
    notification: () => ({
      title: "New Appointment Created",
      message: `A new appointment was created.`,
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(async (req, res) => {
    const { patient, date, time, type, doctor } = req.body;

    if (!patient || !date || !time || !type) {
      return res
        .status(400)
        .json({ error: "Patient, date, time, and type are required." });
    }

    const appt = await Appointment.create({
      patient,
      doctor: doctor || null,
      date,
      time,
      type,
      status: "pending",
    });

    res.status(201).json(appt);
  })
);

/* ---------------------------------------------------------
   GET APPOINTMENTS (role-based)
--------------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "Patient") {
      filter.patient = req.user._id;
    } else if (req.user.role === "Doctor") {
      filter.doctor = req.user._id;
    }
    // Admin & SuperAdmin → all

    const appts = await Appointment.find(filter)
      .populate("patient", "name email phone gender dob")
      .populate("doctor", "name email department")
      .sort({ date: 1, time: 1 });

    res.json(appts);
  } catch (err) {
    console.error("GET /appointments ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
