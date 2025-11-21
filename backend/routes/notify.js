// backend/routes/notify.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/* ============================================================
   UNIVERSAL NOTIFICATION CREATOR
   POST /api/notify
   Body: { title, message, roles, data }
============================================================ */
router.post("/", requireAuth, async (req, res) => {
  try {
    if (!["Admin", "SuperAdmin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { title, message, roles, data } = req.body;

    if (!title || !message || !roles)
      return res.status(400).json({ error: "Missing fields" });

    const notif = await Notification.create({
      title,
      message,
      targetRoles: roles,
      data: data || {},
    });

    res.status(201).json({ message: "Notification sent", notification: notif });
  } catch (err) {
    console.error("NOTIFICATION CREATE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
