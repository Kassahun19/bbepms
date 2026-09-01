import { Router } from 'express';
import { organizationController } from '../controllers/organizationController';

const router = Router();

router.get('/', organizationController.getDistricts);
router.get('/:id', organizationController.getDistrictById);

export default router;
