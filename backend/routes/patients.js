// backend/routes/patients.js

import express from "express";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* ============================================================================ 
   PUBLIC PATIENT CREATION (NO AUTH)
============================================================================ */
router.post("/public", async (req, res) => {
  try {
    const { name, phone, email, gender, dob } = req.body;

    if (!name || !gender || !dob) {
      return res.status(400).json({
        error: "Name, gender, and date of birth are required.",
      });
    }

    const patient = await Patient.create({
      user: null,
      name,
      phone: phone || null,
      email: email || null,
      gender,
      dob,
      assignedDoctor: null,
      isPublic: true,
    });

    return res.status(201).json(patient);
  } catch (err) {
    console.error("PUBLIC PATIENT ERROR:", err);
    return res.status(500).json({ error: "Failed to create patient" });
  }
});

/* ============================================================================ 
   GET PATIENTS (AUTH REQUIRED)
============================================================================ */
router.get("/", requireAuth, async (req, res) => {
  try {
    let filter = {};

    // SuperAdmin/Admin have full access (no filter needed)
    // Doctor access is filtered by assignment
    if (req.user.role === "Doctor") {
      filter.assignedDoctor = req.user._id;
    }

    // Patient access is restricted to their own profile
    if (req.user.role === "Patient") {
      const profile = await Patient.findOne({ user: req.user._id });
      if (!profile) return res.json([]);
      filter._id = profile._id;
    }
    
    // ⭐ ADJUSTMENT: Use lean({ virtuals: true }) to include isProfileComplete efficiently
    const patients = await Patient.find(filter)
      .lean({ virtuals: true })
      .sort({ createdAt: -1 });
      
    return res.json(patients);
  } catch (err) {
    console.error("GET /patients ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================================ 
   ADMIN/DOCTOR/SUPERADMIN CREATE PATIENT
============================================================================ */
router.post("/", requireAuth, async (req, res) => {
  try {
    // RBAC Check: Only Staff/SuperAdmin can create a patient record
    if (!["Admin", "Doctor", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Only Admin/Doctor/SuperAdmin allowed" });
    }

    const { name, phone, email, gender, dob, assignedDoctor } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const allowedGender = ["Male", "Female", "Other"];
    if (gender && !allowedGender.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    const patient = await Patient.create({
      name,
      phone: phone || null,
      email: email || null,
      gender: gender ?? undefined,
      dob: dob ?? null,
      condition: null,
      assignedDoctor: assignedDoctor || null,
      isPublic: false,
    });

    return res.status(201).json(patient);
  } catch (err) {
    console.error("ADMIN CREATE PATIENT ERROR:", err);
    return res.status(500).json({ error: "Failed to create patient" });
  }
});

/* ============================================================================ 
   UPDATE LOGGED-IN PATIENT’S OWN MEDICAL PROFILE  (Patient Only)
   ⭐ FIXED LOGIC: Ensures isProfileComplete is returned.
============================================================================ */
router.put("/me", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "Patient") {
      return res.status(403).json({
        error: "Only patients can update their own profile",
      });
    }

    const { gender, dob, phone, condition } = req.body;

    // 1. Find the Patient profile document linked to the current User ID
    const patientProfile = await Patient.findOne({ user: req.user._id });
    if (!patientProfile) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    const allowedGender = ["Male", "Female", "Other"];
    if (gender && !allowedGender.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    // 2. Perform Atomic Update
    const updatedPatient = await Patient.findByIdAndUpdate(
      patientProfile._id, // CRITICAL: Use the Patient document's _id
      {
        $set: {
          gender,
          dob,
          phone,
          condition,
        },
      },
      // ⭐ CRITICAL FIX: Add 'lean: true' and 'virtuals: true' to include isProfileComplete
      { new: true, runValidators: true, omitUndefined: true, lean: true, virtuals: true }
    );

    return res.json(updatedPatient);
  } catch (err) {
    console.error("UPDATE SELF PATIENT ERROR:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

/* ============================================================================ 
   UPDATE ANY PATIENT BY ID (Admin / Doctor / SuperAdmin)
============================================================================ */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    // RBAC Check
    if (!["Admin", "Doctor", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Only Admin/Doctor/SuperAdmin allowed" });
    }

    const id = req.params.id;
    const { name, phone, email, gender, dob, condition, assignedDoctor } =
      req.body;

    const allowedGender = ["Male", "Female", "Other"];
    if (gender && !allowedGender.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    // ⭐ ADJUSTMENT: Use lean({ virtuals: true }) to include isProfileComplete
    const updated = await Patient.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        email,
        gender: gender ?? undefined,
        dob: dob ?? null,
        condition,
        assignedDoctor: assignedDoctor ?? null,
      },
      { new: true, runValidators: true, lean: true, virtuals: true } // Added lean/virtuals
    );

    if (!updated) {
      return res.status(404).json({ error: "Patient not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("UPDATE PATIENT ERROR:", err);
    return res.status(500).json({ error: "Failed to update patient" });
  }
});


/* ============================================================================ 
   DELETE PATIENT BY ID (Admin / Doctor / SuperAdmin)
============================================================================ */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    // 1. RBAC Check: Ensure SuperAdmin, Admin, and Doctor have privileges
    if (!["Admin", "Doctor", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Only Admin/Doctor/SuperAdmin allowed to delete." });
    }

    const patientId = req.params.id;

    // 2. Delete the Patient Model record
    const deletedPatient = await Patient.findByIdAndDelete(patientId);

    if (!deletedPatient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // 3. Delete the linked User account (HIMS Data Hygiene)
    if (deletedPatient.user) {
      await User.findByIdAndDelete(deletedPatient.user);
    }

    return res.status(200).json({ message: "Patient and linked user successfully deleted." });
  } catch (err) {
    console.error("DELETE PATIENT ERROR:", err);
    return res.status(500).json({ error: "Failed to delete patient" });
  }
});

export default router;