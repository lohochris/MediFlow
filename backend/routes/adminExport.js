// backend/routes/adminExport.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Parser } from "json2csv";

import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";

const router = express.Router();

/* ==========================================================
   EXPORT DATA
   GET /api/admin/export?format=csv&type=users/patients/appointments
========================================================== */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { format, type } = req.query;

    if (!["Admin", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!type) return res.status(400).json({ error: "Missing type parameter" });
    if (format !== "csv")
      return res.status(400).json({ error: "Only CSV export supported" });

    let data = [];

    if (type === "users") {
      data = await User.find().select("-passwordHash -refreshTokens");
    } else if (type === "patients") {
      data = await Patient.find();
    } else if (type === "appointments") {
      data = await Appointment.find();
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`${type}_export.csv`);
    return res.send(csv);
  } catch (err) {
    console.error("EXPORT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
