import { Router } from 'express';
import { targetController } from '../controllers/targetController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', targetController.getAll);
router.get('/:id', targetController.getById);
router.post(
  '/',
  authenticateToken,
  requireRole(['MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR', 'DISTRICT_MANAGER']),
  targetController.create
);

export default router;
