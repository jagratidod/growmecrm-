import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  addDay,
  updateDay,
  deleteDay,
} from '../controllers/itineraryController';

const router = Router();

router.use(authenticate);

router.get('/', getItineraries);
router.get('/:id', getItineraryById);
router.post('/', createItinerary);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);

// Granular Day-level operations
router.post('/:id/days', addDay);
router.put('/:id/days/:dayId', updateDay);
router.delete('/:id/days/:dayId', deleteDay);

export default router;
