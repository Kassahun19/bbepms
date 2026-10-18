// backend/routes/managerRoutes.js
import { Router } from 'express';
import { managerController } from '../controllers/managerController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

const managerRoles = ['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'MANAGER', 'DISTRICT_DIRECTOR'];

router.get('/employees', authMiddleware, requireRole(managerRoles), managerController.getBranchEmployees);
router.post('/employees', authMiddleware, requireRole(managerRoles), managerController.addBranchEmployee);
router.put('/employees/:id', authMiddleware, requireRole(managerRoles), managerController.updateBranchEmployee);
router.delete('/employees/:id', authMiddleware, requireRole(managerRoles), managerController.deleteBranchEmployee);
router.post('/employees/:id/reset-password', authMiddleware, requireRole(managerRoles), managerController.resetEmployeePassword);
router.put('/employees/:id/status', authMiddleware, requireRole(managerRoles), managerController.updateEmployeeStatus);

export default router;
