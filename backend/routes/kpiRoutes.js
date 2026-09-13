// backend/routes/kpiRoutes.js
import { Router } from 'express';
import { kpiController } from '../controllers/kpiController.js';
import { optionalAuth, authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', optionalAuth, kpiController.getKpis);
router.get('/:id', optionalAuth, kpiController.getKpiById);
router.post('/', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR']), kpiController.createKpi);
router.put('/:id', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR']), kpiController.updateKpi);
router.delete('/:id', authMiddleware, requireRole(['BANK_SUPER_ADMIN']), kpiController.deleteKpi);

export default router;
