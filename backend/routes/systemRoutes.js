// backend/routes/systemRoutes.js
import { Router } from 'express';
import { systemController } from '../controllers/systemController.js';
import { optionalAuth, authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/health', systemController.getHealth);
router.get('/audit-logs', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR']), systemController.getAuditLogs);
router.get('/announcements', optionalAuth, systemController.getAnnouncements);
router.post('/announcements', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'CEO']), systemController.createAnnouncement);

export default router;
