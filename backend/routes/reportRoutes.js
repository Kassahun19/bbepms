// backend/routes/reportRoutes.js
import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

const reviewRoles = ['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'DISTRICT_DIRECTOR', 'DIRECTOR', 'CHIEF_OFFICER', 'CEO'];

router.get('/', optionalAuth, reportController.getReports);
router.get('/:id', optionalAuth, reportController.getReportById);
router.post('/', authMiddleware, reportController.createReport);
router.put('/:id', authMiddleware, reportController.updateReport);

// Approval workflows (support both PATCH and POST)
router.patch('/:id/approve', authMiddleware, requireRole(reviewRoles), reportController.approveReport);
router.post('/:id/approve', authMiddleware, requireRole(reviewRoles), reportController.approveReport);

router.patch('/:id/reject', authMiddleware, requireRole(reviewRoles), reportController.rejectReport);
router.post('/:id/reject', authMiddleware, requireRole(reviewRoles), reportController.rejectReport);

router.patch('/:id/return', authMiddleware, requireRole(reviewRoles), reportController.returnReport);
router.post('/:id/return', authMiddleware, requireRole(reviewRoles), reportController.returnReport);

router.post('/bulk-approve', authMiddleware, requireRole(reviewRoles), reportController.bulkApprove);
router.delete('/:id', authMiddleware, reportController.deleteReport);

export default router;
