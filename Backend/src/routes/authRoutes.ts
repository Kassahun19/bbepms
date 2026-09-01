import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRequiredFields } from '../middleware/validator';

const router = Router();

router.post('/login', validateRequiredFields(['userId', 'password']), authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/register', authenticateToken, authController.registerUser);

export default router;
