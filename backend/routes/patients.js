// backend/routes/patients.js
import express from "express";
import Patient from "../models/Patient.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route GET /patients
 * @desc Get all patients OR doctor-assigned patients (?assignedTo=me)
 * @access Private
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { assignedTo } = req.query;

    // Get only patients assigned to the logged-in doctor
    if (assignedTo === "me") {
      const patients = await Patient.find({
        assignedDoctor: req.user.id,
      }).sort({ createdAt: -1 });

      return res.json(patients);
    }

    // Get all patients
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.error("GET /patients error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route POST /patients
 * @desc Create a new patient
 * @access Private (Admin | Doctor)
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, email, phone, gender, dob, condition } = req.body;

    // VALIDATION
    if (!name || !gender || !dob) {
      return res
        .status(400)
        .json({ error: "Name, Gender, and Date of Birth are required." });
    }

    const patient = await Patient.create({
      name,
      email,
      phone,
      gender,
      dob,
      condition,
    });

    res.status(201).json(patient);
  } catch (err) {
    console.error("POST /patients error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route PUT /patients/:id
 * @desc Update patient
 * @access Private
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { name, email, phone, gender, dob, condition } = req.body;

    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, gender, dob, condition },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("PUT /patients/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route DELETE /patients/:id
 * @desc Delete patient
 * @access Private
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const found = await Patient.findById(req.params.id);

    if (!found) {
      return res.status(404).json({ error: "Patient not found" });
    }

    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted" });
  } catch (err) {
    console.error("DELETE /patients/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
