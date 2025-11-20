// backend/config/passport.js
import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

// GOOGLE STRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;

        if (!email) return done(new Error("Google email missing"), null);

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // 🔥 FIX: update existing user basic fields
          user.name = user.name || name;  
          user.isActive = true;
          await user.save();
        } else {
          // 🔥 FIX: create user WITHOUT passwordHash requirement
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

// ❌ IMPORTANT: do NOT serialize user — no sessions used
// passport.serializeUser(() => {});
// passport.deserializeUser(() => {});

export default passport;
