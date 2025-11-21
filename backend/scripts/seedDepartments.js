import mongoose from "mongoose";
import dotenv from "dotenv";
import Department from "../models/Department.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Fix for JSON import
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const departments = JSON.parse(
  fs.readFileSync(path.join(__dirname, "departments.json"), "utf-8")
);

const seedDepartments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📡 Connected to database...");

    await Department.deleteMany();
    console.log("🗑️ Old departments removed.");

    await Department.insertMany(departments);
    console.log("✅ New departments seeded successfully!");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding departments:", error.message);
    process.exit(1);
  }
};

seedDepartments();
