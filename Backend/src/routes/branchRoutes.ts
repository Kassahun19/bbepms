import { Router } from 'express';
import { organizationController } from '../controllers/organizationController';

const router = Router();

router.get('/', organizationController.getBranches);
router.get('/:id', organizationController.getBranchById);

export default router;
