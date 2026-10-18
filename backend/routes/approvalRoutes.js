// backend/routes/approvalRoutes.js
import { Router } from 'express';
import { approvalController } from '../controllers/approvalController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.post('/action', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'DISTRICT_DIRECTOR', 'DIRECTOR', 'CHIEF_OFFICER', 'CEO']), approvalController.executeAction);

export default router;
