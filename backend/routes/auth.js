// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { signAccessToken, signRefreshToken, hashToken } from "../utils/tokens.js";

const router = express.Router();

// ---------------------------------------------
// REGISTER
// ---------------------------------------------
// REGISTER + AUTO LOGIN
// ---------------------------------------------
router.post("/register", async (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(409).json({ error: "Email already used" });

  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || "Patient",
    department: department || "None",
  });

  // Auto-login: generate tokens
  const accessToken = signAccessToken({ sub: user._id, role: user.role });
  const { token: refreshToken, tokenId } = signRefreshToken({
    sub: user._id,
  });

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

  // Send refresh in cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });

  res.status(201).json({
    accessToken,
    user: user.toJSON(),
  });
});

// ---------------------------------------------
// LOGIN (email+password)
// ---------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password, device } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  // Generate tokens
  const accessToken = signAccessToken({ sub: user._id, role: user.role });
  const { token: refreshToken, tokenId } = signRefreshToken({ sub: user._id });

  const refreshHash = await hashToken(refreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  user.refreshTokens.push({
    tokenId,
    tokenHash: refreshHash,
    device: device || "Unknown",
    ip: req.ip,
    expiresAt,
  });

  await user.save();

  // refresh token → cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });

  // access token → frontend will store in localStorage
  res.json({
    accessToken,
    user: user.toJSON(),
  });
});

// ---------------------------------------------
// REFRESH TOKEN (silent login)
// ---------------------------------------------
router.post("/refresh", async (req, res) => {
  const rt = req.cookies?.refreshToken;
  if (!rt) return res.status(401).json({ error: "No refresh token" });

  try {
    const payload = jwt.verify(rt, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid user" });

    const idx = user.refreshTokens.findIndex((t) => t.tokenId === payload.tokenId);
    if (idx === -1) return res.status(401).json({ error: "Invalid refresh token" });

    const entry = user.refreshTokens[idx];

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(rt, entry.tokenHash);
    if (!valid) return res.status(401).json({ error: "Refresh token mismatch" });

    // TOKEN ROTATION
    user.refreshTokens.splice(idx, 1);

    const { token: newRefreshToken, tokenId: newTokenId } = signRefreshToken({
      sub: user._id,
    });

    const newHash = await hashToken(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    user.refreshTokens.push({
      tokenId: newTokenId,
      tokenHash: newHash,
      device: entry.device,
      ip: req.ip,
      expiresAt,
    });

    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    const accessToken = signAccessToken({
      sub: user._id,
      role: user.role,
    });

    // 🔥 MUST SEND USER ALSO
    res.json({
      accessToken,
      user: user.toJSON(),
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

// ---------------------------------------------
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
    } catch (e) {}
  }

  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");

  res.json({ message: "Logged out" });
});

export default router;
