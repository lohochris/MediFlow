// backend/routes/patients.js
import express from "express";
import Patient from "../models/Patient.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* ---------------------------------------------------------
   GET PATIENTS
--------------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "Patient") {
      // patient can only view their own patient profile
      filter.user = req.user._id;
    } else if (req.user.role === "Doctor") {
      filter.assignedDoctor = req.user._id;
    }
    // Admin & SuperAdmin → see all

    const patients = await Patient.find(filter).sort({ createdAt: -1 });

    res.json(patients);
  } catch (err) {
    console.error("GET /patients ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
