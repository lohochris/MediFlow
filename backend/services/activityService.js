// backend/services/activityService.js
import ActivityLog from "../models/ActivityLog.js";
import Notification from "../models/Notification.js";
import appEvents from "../utils/events.js";

/**
 * Create activity log and emit event
 * options: { userId, userName, action, target, meta, notifyRoles }
 */
export const createActivity = async (options = {}) => {
  try {
    const entry = await ActivityLog.create({
      userId: options.userId,
      userName: options.userName,
      action: options.action,
      target: options.target,
      meta: options.meta || {},
      timestamp: new Date(),
    });

    // emit activity event
    appEvents.emit("activity:created", entry);
    return entry;
  } catch (err) {
    console.error("createActivity error:", err);
    return null;
  }
};

/**
 * Create notification and emit event
 * options: { title, message, data, targetRoles }
 */
export const createNotification = async ({ title, message, data = {}, targetRoles = ["SuperAdmin"] }) => {
  try {
    const note = await Notification.create({
      title,
      message,
      targetRoles,
      data,
      timestamp: new Date(),
    });

    // emit notification event
    appEvents.emit("notification:created", note);
    return note;
  } catch (err) {
    console.error("createNotification error:", err);
    return null;
  }
};
