// backend/routes/analyticsRoutes.js
import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/districts', optionalAuth, analyticsController.getDistrictRankings);
router.get('/executive-overview', optionalAuth, analyticsController.getExecutiveOverview);

export default router;
