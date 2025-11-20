// utils/tokens.js
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";


export const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" });
};

export const signRefreshToken = (payload) => {
  // include tokenId to map to DB
  const tokenId = uuidv4();
  const tokenPayload = { ...payload, tokenId };
  const token = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, { expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30}d` });
  return { token, tokenId };
};

export const hashToken = async (token) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(token, salt);
};

export const verifyRefreshTokenHash = (token, hash) => {
  return bcrypt.compare(token, hash);
};
