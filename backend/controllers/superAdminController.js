import User from "../models/User.js";
import bcrypt from "bcryptjs";

// CREATE ADMIN
export const createAdminUser = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    // Throw an error with a custom status code for the router to catch
    const error = new Error("Missing required fields (name, email, password)");
    error.statusCode = 400; 
    throw error;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(password, 10);

  const newAdmin = await User.create({
    name,
    email,
    password: hashed,
    phone,
    role: "Admin",
  });

  // Controller now returns only the data object
  return {
    _id: newAdmin._id,
    name: newAdmin.name,
    email: newAdmin.email,
    phone: newAdmin.phone,
    role: newAdmin.role,
  };
};

// GET ALL ADMINS
export const getAllAdmins = async () => {
  const admins = await User.find({ role: "Admin" }).sort({ createdAt: -1 });
  return admins;
};