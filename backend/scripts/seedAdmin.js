import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import "dotenv/config.js";

async function createSuperAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await User.findOne({ email: "admin@mediflow.com" });
  if (exists) {
    console.log("❗ SuperAdmin already exists.");
    return process.exit(0);
  }

  const passwordHash = await bcrypt.hash("Admin123", 10);

  await User.create({
    name: "System Super Admin",
    email: "admin@mediflow.com",
    passwordHash,       // 👈 MUST BE passwordHash
    role: "SuperAdmin",
    department: "None",
  });

  console.log("🎉 SuperAdmin created successfully!");
  console.log("📧 Email: admin@mediflow.com");
  console.log("🔑 Password: Admin123");
  console.log("⚠️ Change this immediately after login!");

  process.exit(0);
}

createSuperAdmin();
