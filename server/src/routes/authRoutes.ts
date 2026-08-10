// =============================================================================
// Bunna Bank S.C. EPMS - Authentication Routes
// =============================================================================
import { Router } from 'express';
import { loginHandler, refreshTokenHandler, registerHandler } from '../controllers/authController';
import { authRateLimiter } from '../config/security';

const router = Router();

router.post('/login', authRateLimiter, loginHandler);
router.post('/refresh', authRateLimiter, refreshTokenHandler);
router.post('/register', authRateLimiter, registerHandler);

export default router;
