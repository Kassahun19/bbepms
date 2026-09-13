// backend/routes/branchRoutes.js
import { Router } from 'express';
import { branchController } from '../controllers/branchController.js';
import { optionalAuth, authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', optionalAuth, branchController.getBranches);
router.get('/:id', optionalAuth, branchController.getBranchById);
router.post('/', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'DISTRICT_DIRECTOR']), branchController.createBranch);
router.put('/:id', authMiddleware, requireRole(['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'DISTRICT_DIRECTOR']), branchController.updateBranch);
router.delete('/:id', authMiddleware, requireRole(['BANK_SUPER_ADMIN']), branchController.deleteBranch);

export default router;
