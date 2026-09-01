import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';

const router = Router();

router.get('/summary', analyticsController.getDashboardSummary);
router.get('/rankings', analyticsController.getRankings);

export default router;
