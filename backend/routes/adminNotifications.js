// backend/routes/adminNotifications.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/* ============================================================
   GET NOTIFICATIONS (role-based)
   GET /api/admin/notifications?limit=20
============================================================ */
router.get("/", requireAuth, async (req, res) => {
  try {
    const role = req.user.role;
    let limit = parseInt(req.query.limit) || 20;

    const list = await Notification.find({
      targetRoles: { $in: [role] },
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Add "isRead" flag per user
    const final = list.map((n) => ({
      ...n,
      id: n._id,
      isRead: n.readBy?.includes(req.user._id),
    }));

    res.json(final);
  } catch (err) {
    console.error("NOTIFICATION FETCH ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   MARK ALL AS READ
   PATCH /api/admin/notifications/mark-read
============================================================ */
router.patch("/mark-read", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    await Notification.updateMany(
      { targetRoles: { $in: [role] }, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    return res.json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error("MARK READ ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
