/**
 * SERVER.JS — MediFlow HMS Backend (Render-Optimized)
 */

import express from "express";
import dotenv from "dotenv";

dotenv.config();

// Core Middlewares
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import passport from "./config/passport.js";

// DB Connection
import { connectDB } from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.js";
import googleAuthRoutes from "./routes/googleAuth.js";
import userRoutes from "./routes/users.js";
import deptRoutes from "./routes/departments.js";
import doctorRoutes from "./routes/doctor.js";
import appointmentsRoutes from "./routes/appointments.js";
import patientsRoutes from "./routes/patients.js";

import notificationRoutes from "./routes/notifications.js";
import adminNotificationRoutes from "./routes/adminNotifications.js";
import notifyRoutes from "./routes/notify.js";

import adminRoutes from "./routes/admin.js";
import adminReportRoutes from "./routes/adminReports.js";
import adminExportRoutes from "./routes/adminExport.js";

const app = express();

/* -----------------------------------------------------------
   SECURITY & BODY PARSING MIDDLEWARES
----------------------------------------------------------- */
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -----------------------------------------------------------
   FIXED CORS CONFIG — REQUIRED FOR RENDER
----------------------------------------------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",             // Local dev
      "https://mediflow-4zvx.onrender.com" // React frontend (Render)
    ],
    credentials: true, // send/receive cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Prevent preflight (OPTIONS) failure
app.options("*", cors());

/* -----------------------------------------------------------
   PASSPORT INITIALIZATION
----------------------------------------------------------- */
app.use(passport.initialize());

/* -----------------------------------------------------------
   CONNECT TO DATABASE
----------------------------------------------------------- */
connectDB(process.env.MONGO_URI);

/* -----------------------------------------------------------
   ROUTES — ALL PREFIXED WITH /api
----------------------------------------------------------- */

// Auth
app.use("/api/auth", authRoutes);
app.use("/api/auth", googleAuthRoutes);

// Users
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);

// Core Entities
app.use("/api/departments", deptRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/appointments", appointmentsRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/notify", notifyRoutes);

// Admin
app.use("/api/admin", adminRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/admin/export", adminExportRoutes);

/* -----------------------------------------------------------
   HEALTH CHECK
----------------------------------------------------------- */
app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    service: "MediFlow Backend",
    timestamp: new Date().toISOString(),
  })
);

/* -----------------------------------------------------------
   GLOBAL ERROR HANDLER
----------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.stack || err);
  res.status(500).json({
    error: "Server error",
    detail: err.message,
  });
});

/* -----------------------------------------------------------
   START SERVER
----------------------------------------------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 MediFlow backend running on port ${PORT}`);
});
