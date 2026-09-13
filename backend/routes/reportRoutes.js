// backend/routes/reportRoutes.js
import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', optionalAuth, reportController.getReports);
router.get('/:id', optionalAuth, reportController.getReportById);
router.post('/', authMiddleware, reportController.createReport);
router.put('/:id', authMiddleware, reportController.updateReport);
router.patch('/:id/approve', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'DISTRICT_DIRECTOR']), reportController.approveReport);
router.patch('/:id/reject', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'DISTRICT_DIRECTOR']), reportController.rejectReport);
router.post('/bulk-approve', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'DISTRICT_DIRECTOR']), reportController.bulkApprove);
router.delete('/:id', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR']), reportController.deleteReport);

export default router;
