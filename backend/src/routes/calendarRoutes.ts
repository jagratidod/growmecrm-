import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
} from '../controllers/calendarController';

const router = Router();

router.use(authenticate);

router.get('/', getCalendarEvents);
router.post('/', createCalendarEvent);
router.delete('/:id', deleteCalendarEvent);

export default router;
