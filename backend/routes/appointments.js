// backend/routes/appointments.js
import express from "express";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import { requireAuth } from "../middleware/auth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import { withActivity } from "../middleware/withActivity.js";

const router = express.Router();

/* ============================================================================
   CREATE APPOINTMENT — Public + Logged-in Patient + Admin + Doctor
============================================================================ */
router.post(
  "/",
  optionalAuth,
  withActivity({
    action: "Created Appointment",
    systemUser: "Public",
    getTarget: (req, res, appt) =>
      `Appointment ${appt?._id} for patient ${appt?.patient}`,
    notify: true,
    notification: () => ({
      title: "New Appointment Created",
      message: "A new appointment was created.",
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(async (req, res) => {
    try {
      const { patient, patientId, date, time, type, doctor, doctorId } = req.body;

      if (!date || !time || !type) {
        return res.status(400).json({
          error: "Type, date, and time are required",
        });
      }

      let resolvedPatientId = patient || patientId;

      /* --------------------------------------------------------
         LOGGED-IN PATIENT BOOKING
      -------------------------------------------------------- */
      if (req.user && req.user.role === "Patient") {
        const profile = await Patient.findOne({ user: req.user._id });

        if (!profile) {
          return res.status(400).json({
            error: "Your patient profile was not found",
          });
        }

        resolvedPatientId = profile._id;
      }

      /* --------------------------------------------------------
         PUBLIC BOOKING — requires already created patientId
         (public patient is created from BookAppointment.jsx)
      -------------------------------------------------------- */
      if (!resolvedPatientId) {
        return res.status(400).json({
          error: "Patient information is required",
        });
      }

      /* --------------------------------------------------------
         CREATE APPOINTMENT
      -------------------------------------------------------- */
      const appt = await Appointment.create({
        patient: resolvedPatientId,
        doctor: doctorId || doctor || null,
        date,
        time,
        type,
        status: "pending",
      });

      return res.status(201).json(appt);
    } catch (err) {
      console.error("CREATE APPOINTMENT ERROR:", err);
      return res.status(500).json({
        error: "Server error",
      });
    }
  })
);

/* ============================================================================
   GET APPOINTMENTS — Role-Based Filtering
============================================================================ */
router.get("/", requireAuth, async (req, res) => {
  try {
    let filter = {};

    /* PATIENT → only own appointments */
    if (req.user.role === "Patient") {
      const profile = await Patient.findOne({ user: req.user._id });

      if (!profile) {
        return res.json([]); // patient has no profile yet
      }

      filter.patient = profile._id;
    }

    /* DOCTOR → appointments assigned to them */
    if (req.user.role === "Doctor") {
      filter.doctor = req.user._id;
    }

    /* Admin / SuperAdmin → all appointments */

    const appts = await Appointment.find(filter)
      .populate("patient", "name email phone gender dob")
      .populate("doctor", "name email department")
      .sort({ date: 1, time: 1 });

    return res.json(appts);
  } catch (err) {
    console.error("GET /appointments ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================================
   UPDATE APPOINTMENT — Admin, Doctor, SuperAdmin
============================================================================ */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    if (!["Admin", "Doctor", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    let updateData = { ...req.body };

    if (updateData.patientId) {
      updateData.patient = updateData.patientId;
      delete updateData.patientId;
    }

    if (updateData.doctorId) {
      updateData.doctor = updateData.doctorId;
      delete updateData.doctorId;
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("patient", "name email phone gender dob")
      .populate("doctor", "name email department");

    if (!updated) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================================
   DELETE APPOINTMENT — Admin, Doctor, SuperAdmin
============================================================================ */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (!["Admin", "Doctor", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const found = await Appointment.findById(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Not found" });
    }

    await found.deleteOne();

    return res.json({ message: "Appointment deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
