// backend/routes/patients.js
import express from "express";
import Patient from "../models/Patient.js";
import { requireAuth } from "../middleware/auth.js";
import { withActivity } from "../middleware/withActivity.js";

const router = express.Router();

/* ---------------------------------------------------------
   ROLE CHECKER
--------------------------------------------------------- */
const isAdminOrDoctor = (user) => {
  return user.role === "Admin" || user.role === "Doctor" || user.role === "SuperAdmin";
};

/* ---------------------------------------------------------
   1. GET PATIENTS (All or Assigned to Doctor)
--------------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  try {
    const { assignedTo } = req.query;

    // Doctor-specific assigned patients
    if (assignedTo === "me") {
      const patients = await Patient.find({
        assignedDoctor: req.user._id,
      }).sort({ createdAt: -1 });

      return res.json(patients);
    }

    // Everyone else (Admin / SuperAdmin / Doctor) gets all patients
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);

  } catch (err) {
    console.error("GET /patients error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   2. CREATE PATIENT (Admin + Doctor + SuperAdmin)
--------------------------------------------------------- */
const createPatientHandler = async (req, res) => {
  if (!isAdminOrDoctor(req.user)) {
    return res.status(403).json({ error: "Only Admin/Doctor allowed" });
  }

  const { name, email, phone, gender, dob, condition, assignedDoctor } = req.body;

  if (!name || !gender || !dob) {
    return res.status(400).json({
      error: "Name, Gender, and Date of Birth are required.",
    });
  }

  const patient = await Patient.create({
    name,
    email,
    phone,
    gender,
    dob,
    condition,
    assignedDoctor: assignedDoctor || null,
  });

  res.status(201).json(patient);
  return patient; // for Activity + Notifications
};

router.post(
  "/",
  requireAuth,
  withActivity({
    action: "Created Patient",
    getTarget: (req, res, patient) => `Patient: ${patient?.name}`,
    notify: true,
    notification: (req, res, patient) => ({
      title: "New Patient Registered",
      message: `${req.user?.name} registered patient "${patient?.name}"`,
      data: { id: patient?._id, name: patient?.name },
      targetRoles: ["Admin", "SuperAdmin"], // BOTH see it
    }),
  })(createPatientHandler)
);

/* ---------------------------------------------------------
   3. UPDATE PATIENT (Admin + Doctor + SuperAdmin)
--------------------------------------------------------- */
const updatePatientHandler = async (req, res) => {
  if (!isAdminOrDoctor(req.user)) {
    return res.status(403).json({ error: "Only Admin/Doctor allowed" });
  }

  const { name, email, phone, gender, dob, condition, assignedDoctor } = req.body;

  const updated = await Patient.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, gender, dob, condition, assignedDoctor },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return res.status(404).json({ error: "Patient not found" });
  }

  res.json(updated);
  return updated;
};

router.put(
  "/:id",
  requireAuth,
  withActivity({
    action: "Updated Patient",
    getTarget: (req, res, patient) => `Patient: ${patient?.name}`,
    notify: true,
    notification: (req, res, patient) => ({
      title: "Patient Updated",
      message: `${req.user?.name} updated patient "${patient?.name}"`,
      data: { id: patient?._id },
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(updatePatientHandler)
);

/* ---------------------------------------------------------
   4. DELETE PATIENT (Admin + Doctor + SuperAdmin)
--------------------------------------------------------- */
const deletePatientHandler = async (req, res) => {
  if (!isAdminOrDoctor(req.user)) {
    return res.status(403).json({ error: "Only Admin/Doctor allowed" });
  }

  const found = await Patient.findById(req.params.id);

  if (!found) return res.status(404).json({ error: "Patient not found" });

  await Patient.findByIdAndDelete(req.params.id);

  res.json({ message: "Patient deleted" });
  return found; // for logs + notifications
};

router.delete(
  "/:id",
  requireAuth,
  withActivity({
    action: "Deleted Patient",
    getTarget: (req, res, patient) => `Patient: ${patient?.name}`,
    notify: true,
    notification: (req, res, patient) => ({
      title: "Patient Removed",
      message: `${req.user?.name} removed patient "${patient?.name}"`,
      data: { id: patient?._id },
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(deletePatientHandler)
);

export default router;
