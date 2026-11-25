import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/sightseeingController';

const router = Router();

// Protect all sightseeing routes with JWT authentication
router.use(authenticate);

// Routes
router.get('/', getActivities);
router.get('/:id', getActivityById);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
