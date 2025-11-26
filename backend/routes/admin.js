import express from "express";
import {
  getKpis,
  getActivityLogs,
  getDoctorPerformance,
  getTrends,
  getNotifications,
} from "../controllers/adminController.js";

import { protect } from "../middleware/auth.js";

import { createAdminUser, getAllAdmins } from "../controllers/superAdminController.js"; // ⭐ ADDED

const router = express.Router();

/**
 * Require SuperAdmin ONLY
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied. SuperAdmin only." });
  }
  next();
};

// All routes require authentication + SuperAdmin role
router.use(protect, requireSuperAdmin);

// -----------------------------
// KPIs
// -----------------------------
router.get("/kpis", async (req, res) => {
  try {
    const data = await getKpis(req, res);
    return res.json(data || {});
  } catch (err) {
    console.error("ADMIN KPIS ERROR:", err);
    return res.json({});
  }
});

// -----------------------------
// Activity Logs
// -----------------------------
router.get("/activity", async (req, res) => {
  try {
    const logs = await getActivityLogs(req, res);
    return res.json(Array.isArray(logs) ? logs : []);
  } catch (err) {
    console.error("ADMIN ACTIVITY ERROR:", err);
    return res.json([]);
  }
});

// -----------------------------
// Top Doctor Performance
// -----------------------------
router.get("/doctor-performance", async (req, res) => {
  try {
    const data = await getDoctorPerformance(req, res);
    return res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("ADMIN DOC PERF ERROR:", err);
    return res.json([]);
  }
});

// -----------------------------
// Trends
// -----------------------------
router.get("/trends", async (req, res) => {
  try {
    const data = await getTrends(req, res);
    return res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("ADMIN TRENDS ERROR:", err);
    return res.json([]);
  }
});

// -----------------------------
// Notifications
// -----------------------------
router.get("/notifications", async (req, res) => {
  try {
    const data = await getNotifications(req, res);
    return res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("ADMIN NOTIFICATIONS ERROR:", err);
    return res.json([]);
  }
});

// -----------------------------
// ⭐ CREATE ADMIN USER
// -----------------------------
router.post("/admins", async (req, res) => {
  try {
    // The controller MUST return ONLY the data object (the created admin).
    const admin = await createAdminUser(req, res);
    
    // Check if the controller returned an Express response object (res), which causes the circular reference error.
    if (admin && admin.constructor && admin.constructor.name === 'ServerResponse') {
        console.warn("Controller returned Express Response object. Please fix 'createAdminUser' to return only data.");
        // If the controller returned a response, it likely already sent headers, so we stop here.
        if (res.headersSent) return; 
    }

    return res.status(201).json(admin);
  } catch (err) {
    console.error("CREATE ADMIN ERROR:", err);
    // FIX: Ensure no double response
    if (res.headersSent) return; 
    return res.status(500).json({ message: "Failed to create admin" });
  }
});

// -----------------------------
// ⭐ GET ALL ADMINS
// -----------------------------
router.get("/admins", async (req, res) => {
  try {
    const admins = await getAllAdmins(req, res);
    return res.json(Array.isArray(admins) ? admins : []);
  } catch (err) {
    console.error("GET ADMINS ERROR:", err);
    // FIX: Ensure no double response
    if (res.headersSent) return;
    return res.json([]);
  }
});

export default router;