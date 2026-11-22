import { Router } from 'express';
import {
  getTeam,
  createTeamInvite,
  revokeInvite,
  updateMemberRole,
  deleteMember,
} from '../controllers/teamController';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// All routes require authenticated tenant user
router.use(authenticate);

router.get('/', getTeam);
router.post('/invite', authorizeRoles('OWNER', 'ADMIN'), createTeamInvite);
router.delete('/invite/:id', authorizeRoles('OWNER', 'ADMIN'), revokeInvite);
router.patch('/:id/role', authorizeRoles('OWNER', 'ADMIN'), updateMemberRole);
router.delete('/:id', authorizeRoles('OWNER', 'ADMIN'), deleteMember);

export default router;
