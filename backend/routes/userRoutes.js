// backend/routes/userRoutes.js
import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

// Allow public and authenticated user fetching
router.get('/', optionalAuth, userController.getUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.post('/', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR']), userController.createUser);
router.put('/:id', authMiddleware, userController.updateUser);
router.patch('/:id/unlock', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR']), userController.unlockUser);
router.delete('/:id', authMiddleware, requireRole(['BANK_SUPER_ADMIN']), userController.deleteUser);

export default router;
