/**
 * SERVER.JS — MediFlow HMS Backend
 * High-standard | Secure | Fully Modular | Real-time Admin Insights
 */

import express from "express";
import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

// Core Middlewares
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import passport from "./config/passport.js";

// DB Connection
import { connectDB } from "./config/db.js";

// Feature Routes
import authRoutes from "./routes/auth.js";
import googleAuthRoutes from "./routes/googleAuth.js";
import userRoutes from "./routes/users.js";
import deptRoutes from "./routes/departments.js";
import doctorRoutes from "./routes/doctor.js";
import appointmentsRoutes from "./routes/appointments.js";
import patientsRoutes from "./routes/patients.js";

// Notifications System
import notificationRoutes from "./routes/notifications.js";
import adminNotificationRoutes from "./routes/adminNotifications.js";
import notifyRoutes from "./routes/notify.js";

// Admin Analytics + Operations
import adminRoutes from "./routes/admin.js";
import adminReportRoutes from "./routes/adminReports.js";
import adminExportRoutes from "./routes/adminExport.js";

const app = express();

/* -----------------------------------------------------------
   SECURITY MIDDLEWARES
----------------------------------------------------------- */
app.use(helmet()); // secure headers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -----------------------------------------------------------
   CORS CONFIG — DEV/PROD SAFE, COOKIE-COMPATIBLE
----------------------------------------------------------- */
app.use(
  cors({
    origin: true, // allow any localhost + allowed origins
    credentials: true, // allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* -----------------------------------------------------------
   PASSPORT INITIALIZATION
----------------------------------------------------------- */
app.use(passport.initialize());

/* -----------------------------------------------------------
   CONNECT TO DATABASE
----------------------------------------------------------- */
connectDB(process.env.MONGO_URI);

/* -----------------------------------------------------------
   ROUTES — STRUCTURED & ORGANIZED
----------------------------------------------------------- */

// AUTH
app.use("/auth", authRoutes);
app.use("/auth", googleAuthRoutes);

// USERS & ROLES
app.use("/users", userRoutes);
app.use("/doctor", doctorRoutes);

// CORE ENTITY ROUTES
app.use("/departments", deptRoutes);
app.use("/patients", patientsRoutes);
app.use("/appointments", appointmentsRoutes);

// NOTIFICATIONS
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/notify", notifyRoutes);

// ADMIN: ANALYTICS + REPORTING + EXPORT
app.use("/api/admin", adminRoutes); // KPIs, performance, activity, trends
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/admin/export", adminExportRoutes);

/* -----------------------------------------------------------
   HEALTH CHECK ENDPOINT
----------------------------------------------------------- */
app.get("/health", (req, res) =>
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
  res.status(500).json({ error: "Server error", detail: err.message });
});

/* -----------------------------------------------------------
   START SERVER
----------------------------------------------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 MediFlow backend running on port ${PORT}`);
});
