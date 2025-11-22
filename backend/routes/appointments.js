import express from "express";
import Appointment from "../models/Appointment.js";
import { requireAuth } from "../middleware/auth.js";
import { withActivity } from "../middleware/withActivity.js";

const router = express.Router();

/* ROLE CHECK */
const isAdminDoctorSuper = (u) =>
  u?.role === "Admin" || u?.role === "Doctor" || u?.role === "SuperAdmin";

/* ---------------------------------------------------------
   1. CREATE APPOINTMENT (PUBLIC BOOKING)
--------------------------------------------------------- */
const createAppointmentHandler = async (req, res) => {
  const { patientId, patient, date, time, type, doctorId } = req.body;

  const resolvedPatient = patientId || patient;
  if (!resolvedPatient || !date || !time || !type) {
    return res.status(400).json({
      error: "Patient, type, date, and time are required.",
    });
  }

  const appt = await Appointment.create({
    patient: resolvedPatient,
    date,
    time,
    type,
    doctor: doctorId || null,
    status: "pending",
  });

  res.status(201).json(appt);
  return appt;
};

router.post(
  "/",
  withActivity({
    action: "Created Appointment",
    systemUser: "Public",
    getTarget: (req, res, appt) =>
      `Appointment ${appt?._id} for patient ${appt?.patient}`,
    notify: true,
    notification: (req, res, appt) => ({
      title: "New Appointment Created",
      message: `A new appointment was created for patient.`,
      data: { id: appt?._id },
      targetRoles: ["SuperAdmin", "Admin"],
    }),
  })(createAppointmentHandler)
);

/* ---------------------------------------------------------
   2. GET ALL APPOINTMENTS
--------------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  try {
    if (!["Admin", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const appts = await Appointment.find()
      .populate("patient", "name email phone gender dob")
      .populate("doctor", "name email department")
      .sort({ date: 1, time: 1 });

    res.json(appts);
  } catch (err) {
    console.error("GET /appointments ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   3. GET LOGGED-IN DOCTOR'S APPOINTMENTS
--------------------------------------------------------- */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const appts = await Appointment.find({
      doctor: req.user._id,
    })
      .populate("patient", "name email phone gender dob")
      .sort({ date: 1, time: 1 });

    res.json(appts);
  } catch (err) {
    console.error("/appointments/my ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   4. UPDATE APPOINTMENT
--------------------------------------------------------- */
const updateAppointmentHandler = async (req, res) => {
  if (!isAdminDoctorSuper(req.user)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updateData = { ...req.body };

  // normalize patientId → patient
  if (updateData.patientId) {
    updateData.patient = updateData.patientId;
    delete updateData.patientId;
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

  res.json(updated);
  return updated;
};

router.put(
  "/:id",
  requireAuth,
  withActivity({
    action: "Updated Appointment",
    getTarget: (req, res, appt) => `Appointment: ${appt?._id}`,
    notify: true,
    notification: (req, res, appt) => ({
      title:
        req.body.status === "completed"
          ? "Appointment Completed"
          : "Appointment Updated",
      message:
        req.body.status === "completed"
          ? `Appointment ${appt?._id} marked completed`
          : `Appointment ${appt?._id} updated`,
      data: { id: appt?._id },
      targetRoles: ["SuperAdmin", "Admin"],
    }),
  })(updateAppointmentHandler)
);

/* ---------------------------------------------------------
   5. DELETE APPOINTMENT
--------------------------------------------------------- */
router.delete(
  "/:id",
  requireAuth,
  withActivity({
    action: "Deleted Appointment",
    getTarget: (req, res, appt) => `Appointment: ${appt?._id}`,
    notify: true,
    notification: (req, res, appt) => ({
      title: "Appointment Deleted",
      message: `${req.user?.name} deleted appointment ${appt?._id}`,
      data: { id: appt?._id },
      targetRoles: ["SuperAdmin", "Admin"],
    }),
  })(async (req, res) => {
    if (!isAdminDoctorSuper(req.user)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: "Not found" });

    await appt.deleteOne();
    res.json({ message: "Appointment deleted" });

    return appt;
  })
);

export default router;
