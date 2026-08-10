// =============================================================================
// Bunna Bank S.C. EPMS - Authentication & RBAC Middleware
// =============================================================================
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No authentication token provided.'
    });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired authentication token.'
    });
  }

  req.user = payload;
  next();
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. User session not found.'
      });
    }

    const userRole = req.user.role.toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    // Super Admin and HR Admin have overriding access
    if (userRole === 'SUPER_ADMIN' || userRole === 'HR_ADMIN' || normalizedAllowed.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access forbidden. Required role: one of [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`
    });
  };
}
