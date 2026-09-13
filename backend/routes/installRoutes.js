// backend/routes/installRoutes.js
import { Router } from 'express';
import { installController } from '../controllers/installController.js';

const router = Router();

// Support both GET and POST for /install and /api/install
router.get('/', installController.runInstall);
router.post('/', installController.runInstall);

export default router;
