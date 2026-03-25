/**
 * AUTHENTICATION MIDDLEWARE
 * 
 * PURPOSE: Verifies the presence and validity of JWT tokens in request headers to identify the user.
 * USAGE: Used by protected routes (e.g., src/routes/user.js, src/routes/admin.js, src/routes/cart.js).
 */
import { verifyToken, extractToken } from "../utils/auth.js"; // Helper functions to handle JWT operations

// TOKEN VALIDATION: Checks the authorization header and verifies the embedded JWT
export const authenticateToken = (req, res, next) => {
  try {
    // Attempt to extract the "Bearer <token>" from the Authorization header
    const token = extractToken(req.headers.authorization);

    // If no token exists, return unauthorized status
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        detail: "Token missing or malformed",
      });
    }

    // Use utility function to verify core JWT validity
    const payload = verifyToken(token);
    
    // Attach the decoded payload (user ID, role, etc.) to the request object
    req.user = payload;
    next();
  } catch (error) {
    // Catch-all for expired or tampered tokens
    return res.status(401).json({
      error: "Unauthorized",
      detail: "Invalid or expired token",
    });
  }
};

// ADMIN AUTHORIZATION: Ensures only users with the 'ADMIN' role can proceed
export const adminRequired = (req, res, next) => {
  // Check if req.user exists (previously populated by authenticateToken)
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
      detail: "Authentication required",
    });
  }

  // Verify the role property is exactly "ADMIN"
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Forbidden",
      detail: "Admin access required",
    });
  }

  // Grant access to the next middleware or route handler
  next();
};
