// backend/routes/users.js
import express from "express";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

/* -------------------------------------------
   1. GET CURRENT USER
------------------------------------------- */
router.get("/me", requireAuth, async (req, res) => {
  res.json(req.user);
});

/* -------------------------------------------
   2. GET ALL USERS  
   - SuperAdmin → full access
   - Admin → allowed
------------------------------------------- */
router.get(
  "/",
  requireAuth,
  (req, res, next) => {
    if (req.user.role === "SuperAdmin") return next();
    if (req.user.role === "Admin") return next();
    return res.status(403).json({ error: "Forbidden" });
  },
  async (req, res) => {
    const users = await User.find().select("-passwordHash -refreshTokens");
    res.json(users);
  }
);

/* -------------------------------------------
   3. UPDATE USER ROLE
   - Only SuperAdmin or Admin
   - Admin cannot modify SuperAdmin
------------------------------------------- */
router.put(
  "/:id/role",
  requireAuth,
  async (req, res) => {
    const actor = req.user;

    // SuperAdmin → full control
    if (actor.role !== "SuperAdmin" && actor.role !== "Admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: "User not found" });

    // Admin cannot modify SuperAdmin
    if (actor.role === "Admin" && target.role === "SuperAdmin") {
      return res.status(403).json({ error: "Cannot modify SuperAdmin" });
    }

    target.role = req.body.role;
    await target.save();

    res.json({ message: "Role updated", user: target });
  }
);

/* -------------------------------------------
   4. UPDATE DEPARTMENT
   - Same rules as role update
------------------------------------------- */
router.put(
  "/:id/department",
  requireAuth,
  async (req, res) => {
    const actor = req.user;

    if (actor.role !== "SuperAdmin" && actor.role !== "Admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: "User not found" });

    if (actor.role === "Admin" && target.role === "SuperAdmin") {
      return res.status(403).json({ error: "Cannot modify SuperAdmin" });
    }

    target.department = req.body.department;
    await target.save();

    res.json({ message: "Department updated", user: target });
  }
);

/* -------------------------------------------
   5. ACTIVATE / DEACTIVATE USER
------------------------------------------- */
router.put(
  "/:id/status",
  requireAuth,
  async (req, res) => {
    const actor = req.user;

    if (actor.role !== "SuperAdmin" && actor.role !== "Admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: "User not found" });

    if (actor.role === "Admin" && target.role === "SuperAdmin") {
      return res.status(403).json({ error: "Cannot modify SuperAdmin" });
    }

    target.isActive = req.body.active;
    await target.save();

    res.json({ message: "Status updated", user: target });
  }
);

/* -------------------------------------------
   6. DELETE USER
------------------------------------------- */
router.delete("/:id", requireAuth, async (req, res) => {
  const actor = req.user;
  const targetId = req.params.id;

  const target = await User.findById(targetId);
  if (!target) return res.status(404).json({ error: "Not found" });

  // PATIENT self-delete only
  if (actor.role === "Patient") {
    if (actor._id.toString() !== targetId) {
      return res.status(403).json({
        error: "Patients can only delete their own account",
      });
    }

    target.deletedAt = new Date();
    target.deletedBy = actor._id;
    await target.save();

    return res.json({ message: "Account soft-deleted" });
  }

  // ADMIN / SUPERADMIN DELETE
  if (actor.role === "Admin" || actor.role === "SuperAdmin") {
    const hard = req.query.hard === "true";

    // Admin cannot delete SuperAdmin
    if (actor.role === "Admin" && target.role === "SuperAdmin") {
      return res.status(403).json({ error: "Cannot delete SuperAdmin" });
    }

    if (hard) {
      const confirm = req.body.confirm;
      if (confirm !== `DELETE ${targetId}`) {
        return res.status(400).json({ error: "Invalid confirmation string" });
      }
      await User.deleteOne({ _id: targetId });
      return res.json({ message: "Permanently deleted" });
    }

    // soft delete
    target.deletedAt = new Date();
    target.deletedBy = actor._id;
    await target.save();

    return res.json({ message: "Soft deleted" });
  }

  res.status(403).json({ error: "Forbidden" });
});

export default router;
