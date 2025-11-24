// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { signAccessToken, signRefreshToken, hashToken } from "../utils/tokens.js";

const router = express.Router();

// -----------------------------------------------------------------------------
// REGISTER (Auto-login)
// -----------------------------------------------------------------------------
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

  // Create tokens
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

  // FIXED COOKIE — now works on Render
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,        // REQUIRED FOR HTTPS + CROSS-SITE
    sameSite: "None",    // REQUIRED for browser to send cookie
    path: "/",
  });

  return res.status(201).json({
    accessToken,
    user: user.toJSON(),
  });
});

// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password, device } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  // Create tokens
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

  // FIXED COOKIE — now works on Render
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });

  return res.json({
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

    const idx = user.refreshTokens.findIndex((t) => t.tokenId === payload.tokenId);
    if (idx === -1) return res.status(401).json({ error: "Invalid refresh token" });

    const entry = user.refreshTokens[idx];

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(rt, entry.tokenHash);
    if (!valid) return res.status(401).json({ error: "Token mismatch" });

    // ROTATE TOKEN
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

    // FIXED COOKIE — now works on Render
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });

    const accessToken = signAccessToken({
      sub: user._id,
      role: user.role,
    });

    return res.json({
      accessToken,
      user: user.toJSON(),
    });
  } catch (err) {
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
    } catch (_) {}
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });

  return res.json({ message: "Logged out" });
});

export default router;
