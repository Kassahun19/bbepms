// backend/routes/targetRoutes.js
import { Router } from 'express';
import { targetController } from '../controllers/targetController.js';
import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

const assignRoles = ['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'DISTRICT_DIRECTOR', 'DIRECTOR', 'CHIEF_OFFICER', 'CEO'];

router.get('/', optionalAuth, targetController.getTargets);
router.get('/:id', optionalAuth, targetController.getTargetById);
router.post('/', authMiddleware, requireRole(assignRoles), targetController.createTarget);
router.post('/send', authMiddleware, requireRole(assignRoles), targetController.sendTargets);
router.post('/batch-respond', authMiddleware, requireRole(assignRoles), targetController.batchRespond);
router.post('/:id/respond', authMiddleware, requireRole(assignRoles), targetController.respondToTarget);
router.put('/:id', authMiddleware, requireRole(assignRoles), targetController.updateTarget);
router.patch('/:id/accept', authMiddleware, requireRole(assignRoles), targetController.acceptTarget);
router.patch('/:id/reject', authMiddleware, requireRole(assignRoles), targetController.rejectTarget);
router.delete('/:id', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER']), targetController.deleteTarget);

export default router;
