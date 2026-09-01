import { Router } from 'express';
import { dailyReportController } from '../controllers/dailyReportController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequiredFields } from '../middleware/validator';

const router = Router();

router.get('/', dailyReportController.getAll);
router.get('/:id', dailyReportController.getById);
router.post(
  '/',
  authenticateToken,
  validateRequiredFields(['report_date', 'employee_id']),
  dailyReportController.submitReport
);
router.patch(
  '/:id/review',
  authenticateToken,
  requireRole(['MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR', 'DISTRICT_MANAGER']),
  dailyReportController.reviewReport
);

export default router;
