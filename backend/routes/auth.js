// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import { signAccessToken, signRefreshToken, hashToken } from "../utils/tokens.js";

const router = express.Router();

// -----------------------------------------------------------------------------
// REGISTER + AUTO CREATE PATIENT RECORD
// -----------------------------------------------------------------------------
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already used" });

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || "Patient",
  });

  // AUTO-CREATE A PATIENT PROFILE
  if (user.role === "Patient") {
    await Patient.create({
      user: user._id,
      name: user.name,
      email: user.email,
      phone: null,
      gender: null,
      dob: null,
      assignedDoctor: null,
    });
  }

  // Tokens
  const accessToken = signAccessToken({ sub: user._id, role: user.role });
  const { token: refreshToken, tokenId } = signRefreshToken({ sub: user._id });

  const refreshHash = await hashToken(refreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  user.refreshTokens.push({
    tokenId,
    tokenHash: refreshHash,
    device: "Registration",
    ip: req.ip,
    expiresAt,
  });

  await user.save();

  // Set refresh cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });

  res.status(201).json({
    accessToken,
    user: user.toJSON(),
  });
});

// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccessToken({ sub: user._id, role: user.role });
  const { token: refreshToken, tokenId } = signRefreshToken({ sub: user._id });

  const refreshHash = await hashToken(refreshToken);

  user.refreshTokens.push({
    tokenId,
    tokenHash: refreshHash,
    device: "Login",
    ip: req.ip,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
  });

  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });

  res.json({
    accessToken,
    user: user.toJSON(),
  });
});

// -----------------------------------------------------------------------------
// REFRESH TOKEN
// -----------------------------------------------------------------------------
router.post("/refresh", async (req, res) => {
  const rt = req.cookies?.refreshToken;
  if (!rt) return res.status(401).json({ error: "No refresh token" });

  try {
    const payload = jwt.verify(rt, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid user" });

    const entry = user.refreshTokens.find((t) => t.tokenId === payload.tokenId);
    if (!entry) return res.status(401).json({ error: "Invalid refresh token" });

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(rt, entry.tokenHash);
    if (!valid) return res.status(401).json({ error: "Token mismatch" });

    // Rotate
    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.tokenId !== payload.tokenId
    );

    const { token: newRT, tokenId: newID } = signRefreshToken({ sub: user._id });
    const newHash = await hashToken(newRT);

    user.refreshTokens.push({
      tokenId: newID,
      tokenHash: newHash,
      device: entry.device,
      ip: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    });

    await user.save();

    // Set cookie
    res.cookie("refreshToken", newRT, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });

    const accessToken = signAccessToken({
      sub: user._id,
      role: user.role,
    });

    res.json({
      accessToken,
      user: user.toJSON(),
    });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

// -----------------------------------------------------------------------------
// LOGOUT
// -----------------------------------------------------------------------------
router.post("/logout", async (req, res) => {
  const rt = req.cookies?.refreshToken;

  if (rt) {
    try {
      const payload = jwt.verify(rt, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.sub);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t.tokenId !== payload.tokenId
        );
        await user.save();
      }
    } catch {}
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });

  res.json({ message: "Logged out" });
});

export default router;
