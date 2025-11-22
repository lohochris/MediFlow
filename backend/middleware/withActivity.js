// backend/middleware/withActivity.js
import { createActivity, createNotification } from "../services/activityService.js";

/**
 * withActivity - Attaches automatic activity logging and optional notifications
 * to any controller handler.
 *
 * Professional + Clean + Predictable version:
 * - Works EVEN if controller already sends res.json()
 * - Doctors DO NOT receive notifications (Admin + SuperAdmin only)
 * - Activity logs ALWAYS record the event
 * - Notification rules fully controlled by config
 */

export const withActivity = ({
  action = "Performed Action",
  getTarget = null,
  notify = false,
  notification = null,
} = {}) => {
  return (handler) => {
    return async (req, res, next) => {
      let result = null;

      try {
        // Call the original controller
        result = await handler(req, res, next);
      } catch (error) {
        return next(error);
      }

      /* ---------------------------------------------------------
         1. CREATE ACTIVITY LOG
      --------------------------------------------------------- */
      try {
        await createActivity({
          userId: req.user?._id,
          userName: req.user?.name || req.user?.email || "Unknown User",
          action,
          target: typeof getTarget === "function"
            ? getTarget(req, res, result)
            : undefined,
          meta: {
            body: req.body,
            params: req.params,
            result,
          },
        });
      } catch (err) {
        console.error("Activity Logging Failed:", err);
      }

      /* ---------------------------------------------------------
         2. CREATE ADMIN-ONLY NOTIFICATIONS
      --------------------------------------------------------- */
      if (notify && typeof notification === "function") {
        try {
          const n = notification(req, res, result);

          if (n && n.title && n.message) {
            await createNotification({
              title: n.title,
              message: n.message,
              data: n.data,
              // 🔒 Force only Admin + SuperAdmin (Even if developer forgets)
              targetRoles: ["Admin", "SuperAdmin"],
            });
          }
        } catch (err) {
          console.error("Notification Failed:", err);
        }
      }

      return result;
    };
  };
};
