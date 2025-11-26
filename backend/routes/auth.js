// backend/routes/auth.js

import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
// Assuming these are custom utilities:
import { signAccessToken, signRefreshToken, hashToken } from "../utils/tokens.js"; 

const router = express.Router();

/* ============================================================
    REGISTER (Unchanged)
============================================================ */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "Patient",
    });

    let patientProfile = null;

    if (user.role === "Patient") {
      patientProfile = await Patient.create({
        user: user._id,
        name: user.name,
        email: user.email,
        phone: null,
        gender: undefined,
        dob: undefined,
        condition: null,
        assignedDoctor: null,
      });
    }

    const accessToken = signAccessToken({ sub: user._id, role: user.role });

    const { token: refreshToken, tokenId } = signRefreshToken({ sub: user._id });
    const refreshHash = await hashToken(refreshToken);

    await User.updateOne(
      { _id: user._id },
      {
        $push: {
          refreshTokens: {
            tokenId,
            tokenHash: refreshHash,
            device: "Registration",
            ip: req.ip,
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          },
        },
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });

    return res.status(201).json({
      accessToken,
      user: {
        ...user.toJSON(),
        patientId: patientProfile?._id ?? null,
        patientProfile,
      },
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error registering user." });
  }
});

/* ============================================================
    LOGIN (Unchanged)
============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    let patientProfile = null;

    if (user.role === "Patient") {
      patientProfile = await Patient.findOne({ user: user._id });
    }

    const accessToken = signAccessToken({ sub: user._id, role: user.role });

    const { token: refreshToken, tokenId } = signRefreshToken({ sub: user._id });
    const refreshHash = await hashToken(refreshToken);

    await User.updateOne(
      { _id: user._id },
      {
        $push: {
          refreshTokens: {
            tokenId,
            tokenHash: refreshHash,
            device: "Login",
            ip: req.ip,
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          },
        },
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });

    return res.json({
      accessToken,
      user: {
        ...user.toJSON(),
        patientId: patientProfile?._id ?? null,
        patientProfile,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error logging in." });
  }
});

/* ============================================================
    REFRESH ACCESS TOKEN (FIXED FOR 401 ERRORS)
============================================================ */
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token available" });
    }

    // 1. Verify the Refresh Token. This step throws the TokenExpiredError.
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = payload.sub;
    const tokenId = payload.jti;

    // 2. Find the user and the stored token hash (select refreshTokens)
    const user = await User.findById(userId).select("+refreshTokens"); 
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 3. Find the specific stored token (using .id for subdocument lookup)
    // ⭐ FIX: Use Mongoose .id to find the subdocument directly
    const storedToken = user.refreshTokens.id(tokenId); 
    
    if (!storedToken) {
      // 401: Token not found in the DB (may have been revoked or user logged out)
      return res.status(401).json({ error: "Refresh token revoked or expired" });
    }

    // 4. Hash the incoming token and compare it with the stored hash
    const incomingTokenHash = await hashToken(refreshToken);

    if (incomingTokenHash !== storedToken.tokenHash) {
      // 401: Hashes don't match -> Invalid or tampered token
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // 5. Generate new Access Token
    const newAccessToken = signAccessToken({ sub: userId, role: user.role });

    // 6. Get associated profile data for the frontend
    let patientProfile = null;
    // Use .toObject() or .toJSON() on the User document to strip refreshTokens field before sending
    const finalUser = user.toObject(); 

    if (finalUser.role === "Patient") {
      patientProfile = await Patient.findOne({ user: finalUser._id }).lean();
    }

    // 7. Respond with the new token and user data
    return res.json({
      accessToken: newAccessToken,
      // ⭐ FIX: Ensure we only send the required user data (no password hash or refresh tokens)
      user: {
        ...finalUser,
        passwordHash: undefined, // Explicitly remove
        refreshTokens: undefined, // Explicitly remove
        patientId: patientProfile?._id ?? null,
        patientProfile,
      },
    });
  } catch (err) {
    // This catches the TokenExpiredError from jwt.verify()
    console.error("REFRESH TOKEN ERROR:", err);

    // Clear the cookie on the client side to force re-login
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });

    // Send 401 to force a new login on the frontend
    return res.status(401).json({ error: "Token refresh failed. Please log in again." });
  }
});

/* ============================================================
    LOGOUT (Added for consistency)
============================================================ */
router.post("/logout", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    // 1. Check if token exists
    if (refreshToken) {
        try {
            // 2. Verify token to get user ID and token ID
            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const userId = payload.sub;
            const tokenId = payload.jti;

            // 3. Remove the specific token from the user's document
            await User.updateOne(
                { _id: userId },
                { $pull: { refreshTokens: { tokenId: tokenId } } }
            );
        } catch (err) {
            // Log error but proceed to clear cookie
            console.warn("Error revoking token during logout:", err.message);
        }
    }

    // 4. Clear the cookie on the client side
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });

    return res.status(200).json({ message: "Logged out successfully" });
});


/* ============================================================
    GET LOGGED-IN USER (no requireAuth) (Unchanged)
============================================================ */
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(200).json(null); // allow UI reload
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(payload.sub).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    let patientProfile = null;

    if (user.role === "Patient") {
      patientProfile = await Patient.findOne({ user: user._id }).lean();
    }

    return res.json({
      ...user,
      patientId: patientProfile?._id || null,
      patientProfile,
    });

  } catch (err) {
    console.error("ME ERROR:", err.message);
    return res.status(200).json(null); // do NOT break reload
  }
});

export default router;