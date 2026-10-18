// backend/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'bunna_epms_jwt_secure_secret_2026';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.userId || decoded.id;
        } catch (jwtErr) {
          // Token expired or invalid, fallback to header check below
        }
      }
    }

    // Fallback to x-user-id or x-user-role header for seamless UI role switching & resilience
    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (!userId && req.headers['x-user-role']) {
      const roleUser = await User.findByUsernameOrEmail(req.headers['x-user-role']);
      if (roleUser) {
        userId = roleUser.user_id || roleUser.id;
      }
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Access token or authentication identity required. Please log in.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authenticated user account no longer exists.' });
    }

    if (user.is_locked) {
      return res.status(403).json({ success: false, error: 'Account is locked. Please contact your administrator.' });
    }

    req.user = {
      userId: user.user_id || user.id,
      id: user.user_id || user.id,
      username: user.system_username || user.userId || user.user_id,
      email: user.email,
      role: req.headers['x-user-role'] || user.role,
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

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.userId || decoded.id;
        } catch (jwtErr) {}
      }
    }

    if (!userId) {
      userId = req.headers['x-user-id'];
    }

    if (userId) {
      const user = await User.findById(userId);
      if (user && !user.is_locked) {
        req.user = {
          userId: user.user_id || user.id,
          id: user.user_id || user.id,
          username: user.system_username || user.userId,
          email: user.email,
          role: req.headers['x-user-role'] || user.role,
          jobTitle: user.job_title || user.jobTitle,
          branchId: user.branch_id || user.branchId,
          branchName: user.branch_name || user.branchName,
          districtId: user.district_id || user.districtId,
          districtName: user.district_name || user.districtName,
          departmentId: user.department_id || user.departmentId,
          fullName: `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim()
        };
      }
    }
  } catch (err) {}
  return next();
}

export default authMiddleware;
