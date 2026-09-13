// backend/routes/competitorRoutes.js
import { Router } from 'express';
import { competitorController } from '../controllers/competitorController.js';
import { optionalAuth, authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/banks', optionalAuth, competitorController.getBanks);
router.get('/branches', optionalAuth, competitorController.getBranches);
router.get('/metrics', optionalAuth, competitorController.getKpiMetrics);
router.get('/bpi-weights', optionalAuth, competitorController.getBpiWeights);
router.put('/bpi-weights', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'CEO', 'BOARD_OF_DIRECTORS']), competitorController.updateBpiWeights);
router.get('/ai-insights', optionalAuth, competitorController.getAiInsights);
router.get('/catchment-gaps', optionalAuth, competitorController.getCatchmentGaps);

export default router;
