// backend/services/activityService.js
import ActivityLog from "../models/ActivityLog.js";
import Notification from "../models/Notification.js";
import appEvents from "../utils/events.js";

/**
 * createActivity()
 * Record activity log in DB and emit system event
 */
export const createActivity = async ({
  userId,
  userName,
  action,
  target,
  meta = {},
}) => {
  try {
    const entry = await ActivityLog.create({
      userId,
      userName,
      action,
      target,
      meta,
      timestamp: new Date(),
    });

    // Emit activity event for real-time streaming (optional)
    appEvents.emit("activity:created", entry);

    return entry;
  } catch (err) {
    console.error("❌ createActivity error:", err);
    return null;
  }
};

/**
 * createNotification()
 * Create system notification for Admin + SuperAdmin only
 */
export const createNotification = async ({
  title,
  message,
  data = {},
  // Even if backend passes something, we FORCE security roles
  targetRoles = ["Admin", "SuperAdmin"],
}) => {
  try {
    const note = await Notification.create({
      title,
      message,
      data,
      targetRoles,         // Only Admin + SuperAdmin
      timestamp: new Date(),
    });

    // Emit notification event (for websockets or SSE)
    appEvents.emit("notification:created", note);

    return note;
  } catch (err) {
    console.error("❌ createNotification error:", err);
    return null;
  }
};
