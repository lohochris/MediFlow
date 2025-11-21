// backend/routes/appointments.js
import express from "express";
import Appointment from "../models/Appointment.js";
import { requireAuth } from "../middleware/auth.js";
import { withActivity } from "../middleware/withActivity.js";

const router = express.Router();

/* ---------------------------------------------------------
   ROLE HELPERS
--------------------------------------------------------- */
const isAdminDoctorSuper = (u) =>
  u?.role === "Admin" || u?.role === "Doctor" || u?.role === "SuperAdmin";

/* ---------------------------------------------------------
   1. CREATE APPOINTMENT (PUBLIC BOOKING)
   - DOES NOT REQUIRE AUTH
   - STILL LOGS ACTIVITY WITH SYSTEM USER
--------------------------------------------------------- */
const createAppointmentHandler = async (req, res) => {
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

  res.status(201).json(appt);
  return appt;
};

router.post(
  "/",
  withActivity({
    action: "Created Appointment",
    systemUser: "Public", // logs with system actor
    getTarget: (req, res, appt) =>
      `Appointment ${appt?._id} for patient ${appt?.patient}`,
    notify: true,
    notification: (req, res, appt) => ({
      title: "New Appointment Created",
      message: `A new appointment was created for patient ID ${appt?.patient}`,
      data: { id: appt?._id },
      targetRoles: ["SuperAdmin", "Admin"],
    }),
  })(createAppointmentHandler)
);

/* ---------------------------------------------------------
   2. GET ALL APPOINTMENTS (Admin + SuperAdmin)
--------------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "SuperAdmin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const appts = await Appointment.find()
      .populate("patient")
      .populate("doctor")
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
      .populate("patient")
      .sort({ date: 1, time: 1 });

    res.json(appts);
  } catch (err) {
    console.error("GET /appointments/my ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------------------------------------------------
   4. UPDATE APPOINTMENT (Admin + Doctor + SuperAdmin)
--------------------------------------------------------- */
const updateAppointmentHandler = async (req, res) => {
  if (!isAdminDoctorSuper(req.user)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const body = { ...req.body };

  // normalize patientId -> patient
  if (body.patientId) {
    body.patient = body.patientId;
    delete body.patientId;
  }

  const updated = await Appointment.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });

  if (!updated)
    return res.status(404).json({ error: "Appointment not found" });

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
    notification: (req, res, appt) => {
      const completed = req.body.status === "completed";
      return {
        title: completed
          ? "Appointment Completed"
          : "Appointment Updated",
        message: completed
          ? `Appointment ${appt?._id} was marked COMPLETED`
          : `Appointment ${appt?._id} was updated`,
        data: {
          id: appt?._id,
          status: appt?.status,
          doctor: appt?.doctor,
        },
        targetRoles: ["SuperAdmin", "Admin"],
      };
    },
  })(updateAppointmentHandler)
);

/* ---------------------------------------------------------
   5. DELETE APPOINTMENT (Admin + Doctor + SuperAdmin)
--------------------------------------------------------- */
const deleteAppointmentHandler = async (req, res) => {
  if (!isAdminDoctorSuper(req.user)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const appt = await Appointment.findById(req.params.id);
  if (!appt)
    return res.status(404).json({ error: "Appointment not found" });

  await appt.deleteOne();

  res.json({ message: "Appointment deleted" });
  return appt;
};

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
  })(deleteAppointmentHandler)
);

export default router;
