// backend/routes/googleAuth.js
import express from "express";
import passport from "passport";
import User from "../models/User.js";
import { signAccessToken, signRefreshToken, hashToken } from "../utils/tokens.js";

const router = express.Router();

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

      // Store refresh token securely
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

      // 🔥 FIXED — ENABLE cross-site cookie for Google Redirect
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,       // true ONLY in production with HTTPS
        sameSite: "None",    // <--- REQUIRED FOR GOOGLE REDIRECT
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });

      const FRONTEND = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

      // Pass access token to frontend so it can save it
      const redirectUrl = `${FRONTEND}/oauth-success?token=${accessToken}`;

      return res.redirect(redirectUrl);
    } catch (err) {
      console.error("Google OAuth Error:", err);
      return res.redirect("/login");
    }
  }
);

export default router;
