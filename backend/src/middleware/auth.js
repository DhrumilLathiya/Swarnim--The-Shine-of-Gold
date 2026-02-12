import { verifyToken, extractToken } from "../utils/auth.js";

/**
 * Middleware to verify JWT token
 */
export const authenticateToken = (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        detail: "Token missing or malformed",
      });
    }

    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      detail: "Invalid or expired token",
    });
  }
};

/**
 * Middleware to check admin role
 */
export const adminRequired = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
      detail: "Authentication required",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Forbidden",
      detail: "Admin access required",
    });
  }

  next();
};
