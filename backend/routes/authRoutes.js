// backend/routes/authRoutes.js
import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);
router.post('/unlock', authMiddleware, authController.unlockAccount);

export default router;
