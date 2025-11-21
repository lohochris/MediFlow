// backend/middleware/withActivity.js
import { createActivity, createNotification } from "../services/activityService.js";

/**
 * withActivity - wraps an async controller handler and logs activity after success
 *
 * @param {Object} opts
 *   - action: string, human friendly (e.g. "Created Doctor")
 *   - getTarget: function(req, res, result) => string (target description)
 *   - notify: boolean (whether to create a notification)
 *   - notification: function(req, res, result) => { title, message, data, targetRoles }
 *
 * Usage:
 *   router.post("/departments", withActivity({
 *     action: "Created Department",
 *     getTarget: (req, res, result) => `Department: ${result.name}`,
 *     notify: true,
 *     notification: (req, res, result) => ({ title: "New Department", message: `${result.name} added`, data: {...}, targetRoles: ["SuperAdmin"] })
 *   }), createDepartmentHandler);
 */
export const withActivity = (opts = {}) => {
  return (handler) => {
    return async (req, res, next) => {
      try {
        // run original handler and capture result if handler returns data
        // We support handlers that either send response themselves or return data.
        const maybeResult = await handler(req, res, next);

        // If handler already ended response (res.headersSent), we still attempt to log using the returned result
        const result = maybeResult;

        // Create activity log
        try {
          await createActivity({
            userId: req.user?._id,
            userName: req.user?.name || req.user?.email,
            action: opts.action || "Performed action",
            target: opts.getTarget ? opts.getTarget(req, res, result) : undefined,
            meta: { body: req.body, params: req.params, result: result },
          });
        } catch (e) {
          console.error("withActivity.createActivity failed:", e);
        }

        // Optionally create notification
        if (opts.notify && typeof opts.notification === "function") {
          try {
            const n = opts.notification(req, res, result);
            if (n && n.title && n.message) {
              await createNotification({
                title: n.title,
                message: n.message,
                data: n.data,
                targetRoles: n.targetRoles || ["SuperAdmin"],
              });
            }
          } catch (e) {
            console.error("withActivity.createNotification failed:", e);
          }
        }

        return result;
      } catch (err) {
        // If handler throws, pass the error along
        return next(err);
      }
    };
  };
};
