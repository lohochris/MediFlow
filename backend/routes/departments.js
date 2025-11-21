// routes/departments.js
import express from "express";
import Department from "../models/Department.js";
import { requireAuth } from "../middleware/auth.js";
import { withActivity } from "../middleware/withActivity.js";

const router = express.Router();

/* ---------------------------------------------------------
   ROLE CHECKER: Admin + SuperAdmin only
--------------------------------------------------------- */
const isAdminOrSuper = (user) => {
  return user.role === "Admin" || user.role === "SuperAdmin";
};

/* ---------------------------------------------------------
   CREATE DEPARTMENT
--------------------------------------------------------- */
const createDepartmentHandler = async (req, res) => {
  if (!isAdminOrSuper(req.user))
    return res.status(403).json({ error: "Forbidden" });

  const { name, description } = req.body;

  if (!name) return res.status(400).json({ error: "Name required" });

  const exists = await Department.findOne({ name });
  if (exists) return res.status(409).json({ error: "Department exists" });

  const dept = await Department.create({
    name,
    description,
    createdBy: req.user._id,
  });

  res.status(201).json(dept);
  return dept;
};

router.post(
  "/",
  requireAuth,
  withActivity({
    action: "Created Department",
    getTarget: (req, res, dept) => `Department: ${dept?.name}`,
    notify: true,
    notification: (req, res, dept) => ({
      title: "New Department Added",
      message: `${req.user?.name || req.user?.email} added department "${dept?.name}"`,
      data: { id: dept?._id, name: dept?.name },

      // BOTH Admin and SuperAdmin should see this
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(createDepartmentHandler)
);

/* ---------------------------------------------------------
   GET ALL DEPARTMENTS  (Everyone with auth)
--------------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  const depts = await Department.find();
  res.json(depts);
});

/* ---------------------------------------------------------
   UPDATE DEPARTMENT
--------------------------------------------------------- */
const updateDepartmentHandler = async (req, res) => {
  if (!isAdminOrSuper(req.user))
    return res.status(403).json({ error: "Forbidden" });

  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!dept) return res.status(404).json({ error: "Not found" });

  res.json(dept);
  return dept;
};

router.put(
  "/:id",
  requireAuth,
  withActivity({
    action: "Updated Department",
    getTarget: (req, res, dept) => `Department: ${dept?.name}`,
    notify: true,
    notification: (req, res, dept) => ({
      title: "Department Updated",
      message: `${req.user?.name || req.user?.email} updated department "${dept?.name}"`,
      data: { id: dept?._id },

      // Notify BOTH Admin + SuperAdmin
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(updateDepartmentHandler)
);

/* ---------------------------------------------------------
   DELETE DEPARTMENT
--------------------------------------------------------- */
const deleteDepartmentHandler = async (req, res) => {
  if (!isAdminOrSuper(req.user))
    return res.status(403).json({ error: "Forbidden" });

  const dept = await Department.findById(req.params.id);
  if (!dept) return res.status(404).json({ error: "Not found" });

  await dept.deleteOne();

  res.json({ message: "Deleted" });
  return dept;
};

router.delete(
  "/:id",
  requireAuth,
  withActivity({
    action: "Deleted Department",
    getTarget: (req, res, dept) => `Department: ${dept?.name}`,
    notify: true,
    notification: (req, res, dept) => ({
      title: "Department Removed",
      message: `${req.user?.name || req.user?.email} deleted department "${dept?.name}"`,
      data: { id: dept?._id },

      // Notify BOTH Admin + SuperAdmin
      targetRoles: ["Admin", "SuperAdmin"],
    }),
  })(deleteDepartmentHandler)
);

export default router;
