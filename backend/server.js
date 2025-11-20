// server.js
import express from "express";
import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import passport from "./config/passport.js";

import { connectDB } from "./config/db.js";

// ROUTES
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import deptRoutes from "./routes/departments.js";
import googleAuthRoutes from "./routes/googleAuth.js";
import doctorRoutes from "./routes/doctor.js";
import appointmentsRoutes from "./routes/appointments.js";
import patientsRoutes from "./routes/patients.js";

const app = express();

// -------------------------------------------------
// SECURITY
// -------------------------------------------------
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------------------------------------
// CORS — DEV FRIENDLY (ALL LOCALHOST PORTS)
// Required because cookies must be allowed
// -------------------------------------------------
app.use(
  cors({
    origin: true,            // allow all localhost origins automatically
    credentials: true,       // REQUIRED for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -------------------------------------------------
// RATE LIMITING (OPTIONAL IN DEV)
// -------------------------------------------------
// app.use(
//   rateLimit({
//     windowMs: 60 * 1000,
//     max: 100,
//   })
// );

// -------------------------------------------------
// PASSPORT INITIALIZATION
// -------------------------------------------------
app.use(passport.initialize());

// -------------------------------------------------
// CONNECT TO DATABASE
// -------------------------------------------------
connectDB(process.env.MONGO_URI);

// -------------------------------------------------
// ROUTES
// -------------------------------------------------
app.use("/auth", authRoutes);
app.use("/auth", googleAuthRoutes); // Google OAuth
app.use("/users", userRoutes);
app.use("/departments", deptRoutes);
app.use("/patients", patientsRoutes);
app.use("/doctor", doctorRoutes);
app.use("/appointments", appointmentsRoutes);

// -------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------
app.get("/health", (req, res) => res.json({ ok: true }));

// -------------------------------------------------
// GLOBAL ERROR HANDLER
// -------------------------------------------------
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message || err);
  res.status(500).json({ error: "Server error" });
});

// -------------------------------------------------
// START SERVER
// -------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
