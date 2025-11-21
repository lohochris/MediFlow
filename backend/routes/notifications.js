// backend/routes/notifications.js
import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";
import appEvents from "../utils/events.js";

const router = express.Router();

// Get notifications (for current user visibility)
router.get("/", protect, async (req, res) => {
  try {
    // For now we return notifications targeted to the user's role
    const role = req.user.role;
    const notes = await Notification.find({ targetRoles: role ? { $in: [role] } : { $exists: true } })
      .sort({ timestamp: -1 })
      .limit(parseInt(req.query.limit) || 50);

    res.json(notes);
  } catch (err) {
    console.error("GET /notifications error", err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Mark all read for this user
router.post("/mark-all-read", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    // Add userId to readBy for notifications targeted to their role
    await Notification.updateMany(
      { targetRoles: req.user.role, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("POST /notifications/mark-all-read", err);
    res.status(500).json({ message: "Error marking notifications" });
  }
});

// SSE stream for real-time notifications (for roles like SuperAdmin)
router.get("/stream", protect, (req, res) => {
  // only allow roles that should receive real-time updates (e.g., SuperAdmin, Admin)
  const allowed = ["SuperAdmin", "Admin", "Doctor"];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // helper to send event
  const send = (event, data) => {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      // ignore
    }
  };

  // send a ping every 30s to keep connection alive
  const pingInterval = setInterval(() => {
    send("ping", { ts: Date.now() });
  }, 30000);

  // listeners
  const onNotification = (note) => {
    // only send if the note targetRoles includes the user's role
    if (note.targetRoles?.includes(req.user.role)) {
      send("notification", note);
    }
  };

  const onActivity = (act) => {
    // some lightweight activity events for UI updates
    send("activity", act);
  };

  appEvents.on("notification:created", onNotification);
  appEvents.on("activity:created", onActivity);

  // When client disconnects, clean up
  req.on("close", () => {
    clearInterval(pingInterval);
    appEvents.off("notification:created", onNotification);
    appEvents.off("activity:created", onActivity);
    res.end();
  });
});

export default router;
