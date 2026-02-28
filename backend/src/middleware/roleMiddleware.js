export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        error: "Forbidden",
        detail: "User role not defined"
      });
    }

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

    next();
  };
};