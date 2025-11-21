// backend/controllers/adminController.js
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Department from "../models/Department.js";
import ActivityLog from "../models/ActivityLog.js";
import Notification from "../models/Notification.js";

/**
 * SUPERADMIN DASHBOARD CONTROLLERS
 * Clean, production-safe, React-friendly JSON responses
 */

//
// ──────────────────────────────────────────────────────────────
//   1. KPI SUMMARY
// ──────────────────────────────────────────────────────────────
//
export const getKpis = async (req, res) => {
  try {
    const patients = await Patient.countDocuments();
    const doctors = await User.countDocuments({ role: "Doctor" });
    const departments = await Department.countDocuments();

    // Appointments Today (Date stored as "YYYY-MM-DD")
    const today = new Date().toISOString().split("T")[0];

    const appointmentsToday = await Appointment.countDocuments({
      date: today,
    });

    return {
      patients,
      doctors,
      appointmentsToday,
      departments,
    };
  } catch (error) {
    console.error("KPI Error:", error);
    return { patients: 0, doctors: 0, appointmentsToday: 0, departments: 0 };
  }
};

//
// ──────────────────────────────────────────────────────────────
//   2. ACTIVITY LOGS
// ──────────────────────────────────────────────────────────────
//
export const getActivityLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const logs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    console.error("Activity Log Error:", error);
    return [];
  }
};

//
// ──────────────────────────────────────────────────────────────
//   3. DOCTOR PERFORMANCE ANALYTICS
// ──────────────────────────────────────────────────────────────
//
export const getDoctorPerformance = async (req, res) => {
  try {
    // Fetch all doctors
    const doctors = await User.find({ role: "Doctor" }).lean();

    // Count completed appointments per doctor
    const completedAppts = await Appointment.aggregate([
      {
        $match: { status: "completed" },
      },
      {
        $group: {
          _id: "$doctor",
          completed: { $sum: 1 },
        },
      },
    ]);

    const completedMap = {};
    completedAppts.forEach((row) => {
      completedMap[row._id] = row.completed;
    });

    const result = doctors.map((doc) => ({
      id: doc._id,
      name: doc.name,
      department: doc.department || "Unassigned",
      completed: completedMap[doc._id] || 0,
    }));

    return result;
  } catch (error) {
    console.error("Doctor Performance Error:", error);
    return [];
  }
};

//
// ──────────────────────────────────────────────────────────────
//   4. APPOINTMENT + PATIENT FLOW TRENDS
// ──────────────────────────────────────────────────────────────
//
export const getTrends = async (req, res) => {
  try {
    const range = parseInt(req.query.range) || 30;

    // Build array of dates for the last X days
    const days = Array.from({ length: range }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
    }).reverse();

    // Fetch appointments ONLY for those days
    const appts = await Appointment.find({
      date: { $in: days },
    }).lean();

    const map = {};

    days.forEach((d) => {
      map[d] = { date: d, appointments: 0, patients: 0 };
    });

    appts.forEach((appt) => {
      if (!map[appt.date]) return;
      map[appt.date].appointments++;
      map[appt.date].patients++; // 1 appointment = 1 patient visit
    });

    return Object.values(map);
  } catch (error) {
    console.error("Trend Error:", error);
    return [];
  }
};

//
// ──────────────────────────────────────────────────────────────
//   5. NOTIFICATIONS (SuperAdmin Only)
// ──────────────────────────────────────────────────────────────
//
export const getNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const notes = await Notification.find({
      targetRoles: { $in: ["SuperAdmin"] },
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return Array.isArray(notes) ? notes : [];
  } catch (error) {
    console.error("Notifications Error:", error);
    return [];
  }
};
