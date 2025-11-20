// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { permissions } from "../config/permissions.js";  // ✅ FIXED (ESM import)

// -------------------------------------------------------------
// REQUIRE AUTH (JWT VALIDATION)
// -------------------------------------------------------------
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(payload.sub).select("-passwordHash -refreshTokens");

    if (!user) return res.status(401).json({ error: "Unauthorized" });

    if (user.deletedAt) {
      return res.status(403).json({ error: "Account deleted" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// -------------------------------------------------------------
// REQUIRE ROLE (RBAC)
// -------------------------------------------------------------
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // 🔥 SUPERADMIN ALWAYS ALLOWED
    if (req.user.role === "SuperAdmin") return next();

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};

// -------------------------------------------------------------
// PERMISSION CHECKER (PERMISSION-BASED ACCESS CONTROL)
// -------------------------------------------------------------
export const checkPermission = (permissionKey) => {
  return (req, res, next) => {
    const role = req.user?.role;

    // 🔥 SUPERADMIN ALWAYS HAS ALL PERMISSIONS
    if (role === "SuperAdmin") return next();

    const rolePermissions = permissions[role];

    if (!rolePermissions || !rolePermissions[permissionKey]) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};
