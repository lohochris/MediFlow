// backend/routes/googleAuth.js
import express from "express";
import passport from "passport";
import User from "../models/User.js";
import { signAccessToken, signRefreshToken, hashToken } from "../utils/tokens.js";

const router = express.Router();

const isProd = process.env.NODE_ENV === "production";
const FRONTEND = process.env.FRONTEND_URL || process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Step 1 — Start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Step 2 — Google redirects here
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user;

      // Create Access Token
      const accessToken = signAccessToken({
        sub: user._id,
        role: user.role,
      });

      // Create Refresh Token
      const { token: refreshToken, tokenId } = signRefreshToken({
        sub: user._id,
      });

      // Store refresh token securely (hashed)
      const hashed = await hashToken(refreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      user.refreshTokens.push({
        tokenId,
        tokenHash: hashed,
        device: "Google OAuth",
        ip: req.ip,
        expiresAt,
      });

      await user.save();

      // Cookie flags:
      // - secure: true in production (HTTPS)
      // - sameSite: "None" in production to allow cross-site cookie flow
      // - in dev keep sameSite "Lax" and secure false for local convenience
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      // Redirect back to frontend oauth success route — frontend reads the token query and stores it
      // Use FRONTEND env var (set this in Render to your actual frontend URL)
      const redirectUrl = `${FRONTEND.replace(/\/$/, "")}/oauth-success?token=${accessToken}`;

      return res.redirect(redirectUrl);
    } catch (err) {
      console.error("Google OAuth Error:", err);
      return res.redirect("/login");
    }
  }
);

export default router;
