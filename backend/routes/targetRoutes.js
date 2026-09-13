// backend/routes/targetRoutes.js
import { Router } from 'express';
import { targetController } from '../controllers/targetController.js';
import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, targetController.getTargets);
router.get('/:id', optionalAuth, targetController.getTargetById);
router.post('/', authMiddleware, targetController.createTarget);
router.put('/:id', authMiddleware, targetController.updateTarget);
router.patch('/:id/accept', authMiddleware, targetController.acceptTarget);
router.patch('/:id/reject', authMiddleware, targetController.rejectTarget);
router.delete('/:id', authMiddleware, targetController.deleteTarget);

export default router;
