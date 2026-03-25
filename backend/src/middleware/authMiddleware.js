/**
 * CORE AUTHENTICATION MIDDLEWARE (ALTERNATIVE)
 * 
 * PURPOSE: Provides direct JWT validation using the secret key without external utilities.
 * USAGE: This is a standalone alternative to the main auth.js middleware.
 */
import jwt from "jsonwebtoken"; // Primary library for JWT operations
import { config } from "../config/index.js"; // Loads the central config for the secret key

// AUTHENTICATION HANDLER: Validates the incoming 'Bearer' token accurately
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // HEADER VALIDATION: Check for presence and correct format of the Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      detail: "Missing or invalid token",
    });
  }

  // TOKEN EXTRACTION: Isolate the actual JWT string from the 'Bearer' prefix
  const token = authHeader.split(" ")[1];

  try {
    // JWT VERIFICATION: Decode and verify the token using the application's secret key
    const decoded = jwt.verify(token, config.secretKey);
    
    // ATTACH USER: Populate the request object with the decoded user payload
    req.user = decoded;
    next();
  } catch (err) {
    // ERROR HANDLING: Return 401 if the token has been tampered with or is expired
    return res.status(401).json({
      error: "Unauthorized",
      detail: "Invalid or expired token",
    });
  }
};
