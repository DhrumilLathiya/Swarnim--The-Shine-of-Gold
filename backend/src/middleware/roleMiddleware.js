export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        detail: "Authentication required"
      });
    }

    if (!req.user.role) {
      return res.status(403).json({
        error: "Forbidden",
        detail: "User role not defined"
      });
    }

    const userRole = String(req.user.role).toLowerCase().trim();
    const normalizedAllowed = allowedRoles.map(role =>
      String(role).toLowerCase().trim()
    );

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden",
        detail: `Required role: ${normalizedAllowed.join(", ")}`,
      });
    }

    next();
  };
};