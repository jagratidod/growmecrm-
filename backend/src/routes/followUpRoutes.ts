import { Router } from 'express';
import {
  getFollowUps,
  getFollowUpById,
  createFollowUp,
  updateFollowUp,
  toggleFollowUpStatus,
  deleteFollowUp,
} from '../controllers/followUpController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All follow-up routes require authentication and tenant context
router.use(authenticate);

router.get('/', getFollowUps);
router.get('/:id', getFollowUpById);
router.post('/', createFollowUp);
router.put('/:id', updateFollowUp);
router.patch('/:id/toggle', toggleFollowUpStatus);
router.delete('/:id', deleteFollowUp);

export default router;
