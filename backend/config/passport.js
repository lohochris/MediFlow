// backend/config/passport.js
import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

// Determine environment (local dev vs production)
const isProd = process.env.NODE_ENV === "production";

// Choose correct callback URL based on environment
// Production uses Render backend URL
// Development uses localhost
const GOOGLE_REDIRECT_URI = isProd
  ? "https://mediflow-backend-ckj2.onrender.com/api/auth/google/callback"
  : "http://localhost:5000/api/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // 🔥 VERY IMPORTANT
      // Avoid relying 100% on env vars since Render & local differ
      callbackURL: GOOGLE_REDIRECT_URI,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        if (!email) return done(new Error("Google email missing"), null);

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
          // Update basic profile for completeness
          user.name = user.name || name;
          user.isActive = true;
          await user.save();
        } else {
          // Create user without password
          user = await User.create({
            name,
            email,
            passwordHash: null,
            role: "Patient",
            department: "None",
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, null);
      }
    }
  )
);

// No sessions used in JWT mode
// Just leave passport session handlers disabled
export default passport;
