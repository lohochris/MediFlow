// backend/routes/adminReports.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";

import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Department from "../models/Department.js";

const router = express.Router();

/* ==========================================================
   GENERATE ADMIN REPORT
   GET /api/admin/reports/generate
   SuperAdmin + Admin
========================================================== */
router.get("/generate", requireAuth, async (req, res) => {
  try {
    if (!["Admin", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Basic analytics
    const [patientCount, doctorCount, deptCount, apptCount] =
      await Promise.all([
        Patient.countDocuments(),
        User.countDocuments({ role: "Doctor" }),
        Department.countDocuments(),
        Appointment.countDocuments(),
      ]);

    const report = {
      generatedAt: new Date(),
      generatedBy: req.user.name,
      patients: patientCount,
      doctors: doctorCount,
      departments: deptCount,
      totalAppointments: apptCount,
    };

    // Log activity
    await Activity.create({
      userId: req.user._id,
      userName: req.user.name,
      action: "Generated Report",
      target: "Hospital Analytics",
    });

    // Notify SuperAdmin
    await Notification.create({
      userRole: "SuperAdmin",
      title: "Report Generated",
      message: `${req.user.name} generated a performance report`,
    });

    return res.json(report);
  } catch (err) {
    console.error("REPORT GENERATION ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
