import { Router } from 'express';
import { kpiMetricController } from '../controllers/kpiMetricController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', kpiMetricController.getAll);
router.get('/:id', kpiMetricController.getById);
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMINISTRATOR']), kpiMetricController.create);
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMINISTRATOR']), kpiMetricController.update);
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMINISTRATOR']), kpiMetricController.delete);

export default router;
