import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Verify password
 */
export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Create JWT access token
 */
export const createAccessToken = (payload) => {
  const secret = process.env.SECRET_KEY;

  if (!secret) {
    throw new Error("SECRET_KEY is missing in environment variables");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "1d",
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  const secret = process.env.SECRET_KEY;

  if (!secret) {
    throw new Error("SECRET_KEY is missing in environment variables");
  }

  return jwt.verify(token, secret);
};

/**
 * Extract token from Authorization header
 */
export const extractToken = (authHeader) => {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");

  if (parts.length !== 2) return null;
  if (parts[0] !== "Bearer") return null;

  return parts[1];
};
