import { Router } from 'express';
import {
  getOrganization,
  updateOrganization,
  getAvailableSubscriptionPlans,
  upgradeOrganizationPlan,
} from '../controllers/organizationController';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getOrganization);
router.put('/', authorizeRoles('OWNER', 'ADMIN'), updateOrganization);
router.get('/plans', getAvailableSubscriptionPlans);
router.post('/upgrade-plan', authorizeRoles('OWNER', 'ADMIN'), upgradeOrganizationPlan);

export default router;
