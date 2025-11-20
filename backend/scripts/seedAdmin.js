import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import "dotenv/config.js";
import { signRefreshToken, hashToken } from "../utils/tokens.js";

async function createSuperAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await User.findOne({ email: "admin@mediflow.com" });
  if (exists) {
    console.log("❗ SuperAdmin already exists.");
    return process.exit(0);
  }

  const passwordHash = await bcrypt.hash("Admin123!", 10);
  
  // Create refresh token
  const { token: refreshToken, tokenId } = signRefreshToken({
    sub: "superadmin-placeholder"
  });

  const refreshHash = await hashToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Create user with refresh token stored
  await User.create({
    name: "System Super Admin",
    email: "admin@mediflow.com",
    passwordHash,
    role: "SuperAdmin",
    department: "None",
    refreshTokens: [
      {
        tokenId,
        tokenHash: refreshHash,
        device: "Seed Script",
        ip: "127.0.0.1",
        expiresAt
      }
    ]
  });

  console.log("🎉 SuperAdmin created successfully!");
  console.log("📧 Email: admin@mediflow.com");
  console.log("🔑 Password: Admin123!");
  console.log("🔥 A refresh token has been created and saved correctly.");

  process.exit(0);
}

createSuperAdmin();
