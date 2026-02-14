export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        detail: "Authentication required",
      });
    }

    console.log("🛡️ Role Check:", { userRole: req.user.role, allowedRoles });

    if (!allowedRoles.includes(req.user.role)) {
      console.log("❌ Access Denied: Role mismatch");
      return res.status(403).json({
        error: "Forbidden",
        detail: "You do not have permission to access this resource",
      });
    }

    next();
  };
};
