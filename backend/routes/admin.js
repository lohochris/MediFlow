// backend/routes/admin.js
import express from "express";
import {
  getKpis,
  getActivityLogs,
  getDoctorPerformance,
  getTrends,
  getNotifications,
} from "../controllers/adminController.js";

import { protect } from "../middleware/auth.js";

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
// Activity Logs (FIXED)
// MUST ALWAYS RETURN AN ARRAY
// -----------------------------
router.get("/activity", async (req, res) => {
  try {
    const logs = await getActivityLogs(req, res);

    // guarantee frontend always receives an array
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

export default router;
