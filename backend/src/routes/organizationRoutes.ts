import { Router } from 'express';
import { getOrganization, updateOrganization } from '../controllers/organizationController';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getOrganization);
router.put('/', authorizeRoles('OWNER', 'ADMIN', 'SUPER_ADMIN'), updateOrganization);

export default router;
