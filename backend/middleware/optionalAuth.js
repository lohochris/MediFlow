// middleware/optionalAuth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // No token provided → treat as guest
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      req.user = null;
      return next();
    }

    // Decode access token
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(payload.sub).select("-passwordHash");

    req.user = user || null;
    return next();

  } catch (err) {
    // Any error → guest user
    req.user = null;
    return next();
  }
}
