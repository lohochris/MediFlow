// backend/middleware/auth.js (FINALIZED EXPORTS)

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import { permissions } from "../config/permissions.js";

// Utility function to get user payload without sensitive fields
const getSafeUser = async (userId) => {
  return User.findById(userId).select("-passwordHash -refreshTokens -__v");
};

// ============================================================================
// TOKEN ISSUANCE UTILITY
// ============================================================================
export const issueTokens = (user, res) => {
  // 1. Generate Access Token (Short-Lived)
  const accessToken = jwt.sign(
    { sub: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" } 
  );

  // 2. Generate Refresh Token (Long-Lived)
  const refreshToken = jwt.sign(
    { sub: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // 3. Set Refresh Token as an HTTP-Only Cookie
  res.cookie("jid", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });

  // 4. Return the new Access Token 
  return { accessToken, refreshToken };
};

// ============================================================================
// TOKEN REFRESH LOGIC
// ============================================================================
export const refresh = async (req, res, next) => {
  const token = req.cookies.jid; 

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No refresh token." });
  }

  try {
    // 1. Verify refresh token
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // 2. Load user
    const user = await getSafeUser(payload.sub);

    if (!user || user.deletedAt) {
      return res.status(401).json({ error: "Unauthorized: User not found." });
    }

    // 3. Issue new tokens (which also sets a new cookie)
    const { accessToken } = issueTokens(user, res);
    
    // 4. Send new access token back 
    return res.json({ accessToken, user: user.toJSON() });
  } catch (err) {
    console.error("REFRESH ERROR:", err);
    // Clear the invalid cookie on failure
    res.clearCookie("jid"); 
    return res.status(401).json({ error: "Unauthorized: Invalid refresh token." });
  }
};


// ============================================================================
// REQUIRE AUTH (PROTECTED ENDPOINTS)
// ============================================================================
const requireAuthMiddleware = async (req, res, next) => { // Renamed internally
  let token = null;

  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // 1. Validate access token
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 2. Load user safely
    const user = await getSafeUser(payload.sub);

    if (!user || user.deletedAt) {
      return res.status(401).json({ error: "Unauthorized: User not found or deleted" });
    }

    // 3. Attach patientId
    const patient = await Patient.findOne({ user: user._id }).select("_id");

    req.user = {
      ...user.toJSON(),
      patientId: patient?._id || null,
    };

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    
    // 4. Handle Expired Token
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Expired token", expired: true });
    }

    // For all other errors
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ============================================================================
// REQUIRE ROLE (RBAC) 
// ============================================================================
const requireRoleMiddleware = (roles) => { // Renamed internally
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const allowed = Array.isArray(roles) ? roles : [roles];

    // SuperAdmin bypass
    if (req.user.role === "SuperAdmin") return next();

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};

// ============================================================================
// PERMISSION CHECKER
// ============================================================================
const checkPermissionMiddleware = (permissionKey) => { // Renamed internally
  return (req, res, next) => {
    const role = req.user?.role;

    // SuperAdmin bypass
    if (role === "SuperAdmin") return next();

    const rolePermissions = permissions[role];

    if (!rolePermissions || !rolePermissions[permissionKey]) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};


// ============================================================================
// EXPORTS (ALL TOGETHER AT THE END)
// ============================================================================
export const requireAuth = requireAuthMiddleware;
export const protect = requireAuthMiddleware; // Exporting the same function twice
export const requireRole = requireRoleMiddleware;
export const checkPermission = checkPermissionMiddleware;