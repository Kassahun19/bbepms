// backend/middlewares/roleMiddleware.js

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const userRole = req.user.role;

    // Super Admin has full overarching privilege
    if (userRole === 'BANK_SUPER_ADMIN') {
      return next();
    }

    if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access denied. Role '${userRole}' does not have sufficient permissions for this operation.`
    });
  };
}

export default requireRole;
