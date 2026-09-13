// backend/routes/districtRoutes.js
import { Router } from 'express';
import { districtController } from '../controllers/districtController.js';
import { optionalAuth, authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', optionalAuth, districtController.getDistricts);
router.get('/rankings', optionalAuth, districtController.getDistrictRankings);
router.get('/:id', optionalAuth, districtController.getDistrictById);
router.post('/', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR']), districtController.createDistrict);
router.put('/:id', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR']), districtController.updateDistrict);
router.delete('/:id', authMiddleware, requireRole(['BANK_SUPER_ADMIN']), districtController.deleteDistrict);

export default router;
