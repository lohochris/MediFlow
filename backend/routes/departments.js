// routes/departments.js
import express from "express";
import Department from "../models/Department.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* ---------------------------------------------------------
   HELPER: check if user is Admin or SuperAdmin
--------------------------------------------------------- */
const isAdminOrSuper = (user) => {
  return user.role === "Admin" || user.role === "SuperAdmin";
};

/* ---------------------------------------------------------
   CREATE DEPARTMENT  
   - SuperAdmin: allowed  
   - Admin: allowed  
--------------------------------------------------------- */
router.post("/", requireAuth, async (req, res) => {
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
});

/* ---------------------------------------------------------
   GET ALL DEPARTMENTS
   - SuperAdmin: allowed  
   - Admin: allowed  
   - Doctors / others: allowed (READ ONLY)
--------------------------------------------------------- */
router.get("/", requireAuth, async (req, res) => {
  const depts = await Department.find();
  res.json(depts);
});

/* ---------------------------------------------------------
   UPDATE DEPARTMENT  
   - Only SuperAdmin + Admin
--------------------------------------------------------- */
router.put("/:id", requireAuth, async (req, res) => {
  if (!isAdminOrSuper(req.user))
    return res.status(403).json({ error: "Forbidden" });

  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!dept) return res.status(404).json({ error: "Not found" });

  res.json(dept);
});

/* ---------------------------------------------------------
   DELETE DEPARTMENT  
   - Only SuperAdmin + Admin
--------------------------------------------------------- */
router.delete("/:id", requireAuth, async (req, res) => {
  if (!isAdminOrSuper(req.user))
    return res.status(403).json({ error: "Forbidden" });

  await Department.findByIdAndDelete(req.params.id);

  res.json({ message: "Deleted" });
});

export default router;
