// backend/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'bunna_epms_jwt_secure_secret_2026';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Access token required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'Malformed authorization token.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
    }

    const user = await User.findById(decoded.userId || decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authenticated user no longer exists.' });
    }

    if (user.is_locked) {
      return res.status(403).json({ success: false, error: 'Account is locked. Please contact your administrator.' });
    }

    req.user = {
      userId: user.user_id || user.id,
      id: user.user_id || user.id,
      username: user.system_username || user.userId,
      email: user.email,
      role: user.role,
      jobTitle: user.job_title || user.jobTitle,
      branchId: user.branch_id || user.branchId,
      branchName: user.branch_name || user.branchName,
      districtId: user.district_id || user.districtId,
      districtName: user.district_name || user.districtName,
      departmentId: user.department_id || user.departmentId,
      fullName: `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim()
    };

    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authentication internal error: ' + err.message });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authMiddleware(req, res, next);
}

export default authMiddleware;
