/**
 * ROLE-BASED ACCESS CONTROL (RBAC)
 * 
 * PURPOSE: Restricts access to routes based on user roles (e.g., ADMIN, USER).
 * USAGE: Used in various routes to enforce security policies (e.g., src/routes/jewellery.js).
 */
// ROLE AUTHORIZATION: A factory function that returns a middleware for checking multiple roles
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. AUTH CHECK: Ensure the user is identified (must be used after authenticateToken)
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        detail: "Authentication required"
      });
    }

    // 2. INITIAL ROLE CHECK: Verify if the current user's role is in the whitelist
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        detail: "User role not defined"
      });
    }

    // 3. CASE-INSENSITIVE VALIDATION: Normalize roles to ensure consistent permission checking
    const userRole = req.user.role.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

    console.log("🛡️ Role Check:", {
      userRole,
      allowedRoles: normalizedAllowedRoles
    });
    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden",
        detail: "Insufficient permissions"
      });
    }

    // 4. ACCESS GRANTED: Proceed to the next middleware or final route handler
    next();
  };
};