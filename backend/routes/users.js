// backend/routes/users.js
import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { withActivity } from "../middleware/withActivity.js";

const router = express.Router();

/* ---------------------------------------------------------
   ROLE CHECKER
--------------------------------------------------------- */
const isAdminOrSuper = (user) => {
  return user.role === "Admin" || user.role === "SuperAdmin";
};

/* ---------------------------------------------------------
   1. GET CURRENT USER
--------------------------------------------------------- */
router.get("/me", requireAuth, async (req, res) => {
  res.json(req.user);
});

/* ---------------------------------------------------------
   2. GET ALL USERS  (Admin + SuperAdmin)
--------------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  if (!isAdminOrSuper(req.user))
    return res.status(403).json({ error: "Forbidden" });

  const users = await User.find().select("-passwordHash -refreshTokens");

  res.json(users);
});

/* ---------------------------------------------------------
   3. UPDATE USER ROLE
--------------------------------------------------------- */
const updateRoleHandler = async (req, res) => {
  const actor = req.user;
  const target = await User.findById(req.params.id);

  if (!target) return res.status(404).json({ error: "User not found" });
  if (!isAdminOrSuper(actor)) return res.status(403).json({ error: "Forbidden" });

  // Admin cannot modify SuperAdmin
  if (actor.role === "Admin" && target.role === "SuperAdmin") {
    return res.status(403).json({ error: "Cannot modify SuperAdmin" });
  }

  target.role = req.body.role;
  await target.save();

  res.json({ message: "Role updated", user: target });
  return target; 
};

router.put(
  "/:id/role",
  requireAuth,
  withActivity({
    action: "Updated User Role",
    getTarget: (req, res, user) => `User: ${user?.name} → ${user?.role}`,
    notify: true,
    notification: (req, res, user) => ({
      title: "User Role Updated",
      message: `${req.user?.name} changed ${user?.name}'s role to ${user?.role}`,
      data: { id: user?._id, role: user?.role },
      targetRoles: ["Admin", "SuperAdmin"], // BOTH sides see it
    }),
  })(updateRoleHandler)
);

/* ---------------------------------------------------------
   4. UPDATE USER DEPARTMENT
--------------------------------------------------------- */
const updateUserDepartmentHandler = async (req, res) => {
  const actor = req.user;
  const target = await User.findById(req.params.id);

  if (!target) return res.status(404).json({ error: "User not found" });
  if (!isAdminOrSuper(actor)) return res.status(403).json({ error: "Forbidden" });

  if (actor.role === "Admin" && target.role === "SuperAdmin") {
    return res.status(403).json({ error: "Cannot modify SuperAdmin" });
  }

  target.department = req.body.department;
  await target.save();

  res.json({ message: "Department updated", user: target });
  return target;
};

router.put(
  "/:id/department",
  requireAuth,
  withActivity({
    action: "Updated User Department",
    getTarget: (req, res, user) =>
      `User: ${user?.name} → Dept: ${user?.department}`,
    notify: true,
    notification: (req, res, user) => ({
      title: "User Department Updated",
      message: `${req.user?.name} assigned ${user?.name} to ${user?.department}`,
      data: { id: user?._id, department: user?.department },
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(updateUserDepartmentHandler)
);

/* ---------------------------------------------------------
   5. UPDATE USER STATUS
--------------------------------------------------------- */
const updateStatusHandler = async (req, res) => {
  const actor = req.user;
  const target = await User.findById(req.params.id);

  if (!target) return res.status(404).json({ error: "User not found" });
  if (!isAdminOrSuper(actor)) return res.status(403).json({ error: "Forbidden" });

  if (actor.role === "Admin" && target.role === "SuperAdmin") {
    return res.status(403).json({ error: "Cannot modify SuperAdmin" });
  }

  target.isActive = req.body.active;
  await target.save();

  res.json({ message: "Status updated", user: target });
  return target;
};

router.put(
  "/:id/status",
  requireAuth,
  withActivity({
    action: "Updated User Status",
    getTarget: (req, res, user) =>
      `User: ${user?.name} → ${user?.isActive ? "Active" : "Inactive"}`,
    notify: true,
    notification: (req, res, user) => ({
      title: "User Status Updated",
      message: `${req.user?.name} changed ${user?.name}'s status to ${
        user?.isActive ? "Active" : "Inactive"
      }`,
      data: { id: user?._id, active: user?.isActive },
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(updateStatusHandler)
);

/* ---------------------------------------------------------
   6. DELETE USER (Soft or Hard Delete)
--------------------------------------------------------- */
const deleteUserHandler = async (req, res) => {
  const actor = req.user;
  const targetId = req.params.id;
  const target = await User.findById(targetId);

  if (!target) return res.status(404).json({ error: "Not found" });

  // PATIENT self-delete
  if (actor.role === "Patient") {
    if (actor._id.toString() !== targetId) {
      return res.status(403).json({
        error: "Patients can only delete their own account",
      });
    }

    target.deletedAt = new Date();
    target.deletedBy = actor._id;
    await target.save();

    res.json({ message: "Account soft-deleted" });
    return target;
  }

  // Admin + SuperAdmin rules
  if (!isAdminOrSuper(actor))
    return res.status(403).json({ error: "Forbidden" });

  if (actor.role === "Admin" && target.role === "SuperAdmin") {
    return res.status(403).json({ error: "Cannot delete SuperAdmin" });
  }

  const hard = req.query.hard === "true";

  if (hard) {
    const confirm = req.body.confirm;
    if (confirm !== `DELETE ${targetId}`) {
      return res.status(400).json({ error: "Invalid confirmation string" });
    }

    await User.deleteOne({ _id: targetId });
    res.json({ message: "Permanently deleted" });
    return target;
  }

  // Soft delete
  target.deletedAt = new Date();
  target.deletedBy = actor._id;
  await target.save();

  res.json({ message: "Soft deleted" });
  return target;
};

router.delete(
  "/:id",
  requireAuth,
  withActivity({
    action: "Deleted User",
    getTarget: (req, res, user) => `User: ${user?.name}`,
    notify: true,
    notification: (req, res, user) => ({
      title: "User Deleted",
      message: `${req.user?.name} deleted ${user?.name}`,
      data: { id: user?._id },
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(deleteUserHandler)
);

export default router;
