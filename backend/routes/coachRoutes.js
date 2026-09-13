// backend/routes/coachRoutes.js
import { Router } from 'express';
import { coachController } from '../controllers/coachController.js';
import { optionalAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/chat', optionalAuth, coachController.askCoach);
router.post('/query', optionalAuth, coachController.askCoach);

export default router;
