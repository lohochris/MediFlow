// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { permissions } from "../config/permissions.js";

// -------------------------------------------------------------
// MAIN AUTH MIDDLEWARE
//  - Validates JWT
//  - Attaches user to req.user
// -------------------------------------------------------------
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(payload.sub).select(
      "-passwordHash -refreshTokens"
    );

    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Block deleted accounts
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
// ALIAS FOR CONSISTENCY WITH PROJECT ROUTES
// Used as: router.use(protect)
// -------------------------------------------------------------
export const protect = requireAuth;

// -------------------------------------------------------------
// REQUIRE ROLE (RBAC)
// SuperAdmin automatically bypasses
// -------------------------------------------------------------
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ error: "Unauthorized" });

    const allowed = Array.isArray(roles) ? roles : [roles];

    // SuperAdmin has full access
    if (req.user.role === "SuperAdmin") return next();

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};

// -------------------------------------------------------------
// PERMISSION CHECKER (Permission-based RBAC)
// SuperAdmin automatically bypasses
// -------------------------------------------------------------
export const checkPermission = (permissionKey) => {
  return (req, res, next) => {
    const role = req.user?.role;

    if (role === "SuperAdmin") return next();

    const rolePermissions = permissions[role];

    if (!rolePermissions || !rolePermissions[permissionKey]) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};
