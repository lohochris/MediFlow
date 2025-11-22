// backend/routes/users.js
import express from "express";
import User from "../models/User.js";
import Department from "../models/Department.js";
import { requireAuth } from "../middleware/auth.js";
import { withActivity } from "../middleware/withActivity.js";

const router = express.Router();

/* ---------------------------------------------------------
   ROLE CHECKER
--------------------------------------------------------- */
const isAdminOrSuper = (user) =>
  user.role === "Admin" || user.role === "SuperAdmin";

/* ---------------------------------------------------------
   1. GET CURRENT USER
--------------------------------------------------------- */
router.get("/me", requireAuth, async (req, res) => {
  res.json(req.user);
});

/* ---------------------------------------------------------
   2. GET ALL USERS (Admin + SuperAdmin)
--------------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  if (!isAdminOrSuper(req.user))
    return res.status(403).json({ error: "Forbidden" });

  const users = await User.find().select("-passwordHash -refreshTokens");
  res.json(users);
});

/* ---------------------------------------------------------
   3. CREATE NEW USER (Doctor / Staff Creation)
   (Admin + SuperAdmin)
--------------------------------------------------------- */

const createUserHandler = async (req, res) => {
  const actor = req.user;

  if (!isAdminOrSuper(actor))
    return res.status(403).json({ error: "Forbidden" });

  const { name, email, password, phone, role, department } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({
      error: "Name, email, and role are required.",
    });
  }

  // Admin CANNOT create SuperAdmin
  if (actor.role === "Admin" && role === "SuperAdmin") {
    return res
      .status(403)
      .json({ error: "Admins cannot create SuperAdmin accounts" });
  }

  // Check email uniqueness
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: "Email already exists" });

  // Validate department if supplied
  if (department) {
    const deptExists = await Department.findOne({ name: department });
    if (!deptExists)
      return res.status(400).json({ error: "Invalid department" });
  }

  // Hash password if provided (google accounts may omit)
  let passwordHash = undefined;
  if (password) {
    passwordHash = await User.hashPassword(password);
  }

  const user = await User.create({
    name,
    email,
    phone,
    role,
    department: department || "None",
    passwordHash,
  });

  res.status(201).json(user);
  return user; // for logging + notifications
};

router.post(
  "/",
  requireAuth,
  withActivity({
    action: "Created New User",
    getTarget: (req, res, user) =>
      `User: ${user?.name} (${user?.role})`,
    notify: true,
    notification: (req, res, user) => ({
      title: "New Staff Account Created",
      message: `${req.user?.name} created account for ${user?.name} (${user?.role})`,
      data: { id: user?._id, role: user?.role },
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(createUserHandler)
);

/* ---------------------------------------------------------
   4. UPDATE USER ROLE
--------------------------------------------------------- */
const updateRoleHandler = async (req, res) => {
  const actor = req.user;
  const target = await User.findById(req.params.id);

  if (!target) return res.status(404).json({ error: "User not found" });
  if (!isAdminOrSuper(actor)) return res.status(403).json({ error: "Forbidden" });

  // Admin cannot modify SuperAdmin
  if (actor.role === "Admin" && target.role === "SuperAdmin") {
    return res
      .status(403)
      .json({ error: "Admins cannot modify SuperAdmin accounts" });
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
    getTarget: (req, res, user) =>
      `User: ${user?.name} → ${user?.role}`,
    notify: true,
    notification: (req, res, user) => ({
      title: "User Role Updated",
      message: `${req.user?.name} changed ${user?.name}'s role to ${user?.role}`,
      data: { id: user?._id, role: user?.role },
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(updateRoleHandler)
);

/* ---------------------------------------------------------
   5. UPDATE USER DEPARTMENT
--------------------------------------------------------- */
const updateDepartmentHandler = async (req, res) => {
  const actor = req.user;
  const target = await User.findById(req.params.id);

  if (!target) return res.status(404).json({ error: "User not found" });
  if (!isAdminOrSuper(actor)) return res.status(403).json({ error: "Forbidden" });

  // Admin cannot modify SuperAdmin
  if (actor.role === "Admin" && target.role === "SuperAdmin") {
    return res
      .status(403)
      .json({ error: "Admins cannot modify SuperAdmin accounts" });
  }

  // Validate department
  const deptExists = await Department.findOne({
    name: req.body.department,
  });
  if (!deptExists)
    return res.status(400).json({ error: "Invalid department" });

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
      data: { id: user?._id },
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(updateDepartmentHandler)
);

/* ---------------------------------------------------------
   6. UPDATE USER STATUS (ACTIVE/INACTIVE)
--------------------------------------------------------- */
const updateStatusHandler = async (req, res) => {
  const actor = req.user;
  const target = await User.findById(req.params.id);

  if (!target) return res.status(404).json({ error: "User not found" });
  if (!isAdminOrSuper(actor)) return res.status(403).json({ error: "Forbidden" });

  if (actor.role === "Admin" && target.role === "SuperAdmin") {
    return res.status(403).json({
      error: "Admins cannot modify SuperAdmin accounts",
    });
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
      message: `${req.user?.name} changed ${user?.name}'s status to ${user?.isActive ? "Active" : "Inactive"}`,
      data: { id: user?._id },
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(updateStatusHandler)
);

/* ---------------------------------------------------------
   7. DELETE USER
--------------------------------------------------------- */
const deleteUserHandler = async (req, res) => {
  const actor = req.user;
  const targetId = req.params.id;
  const target = await User.findById(targetId);

  if (!target) return res.status(404).json({ error: "User not found" });

  if (!isAdminOrSuper(actor))
    return res.status(403).json({ error: "Forbidden" });

  if (actor.role === "Admin" && target.role === "SuperAdmin") {
    return res.status(403).json({
      error: "Admin cannot delete SuperAdmin",
    });
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
