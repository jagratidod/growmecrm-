import { Router } from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  recordPayment,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookingController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All routes require authenticated tenant user
router.use(authenticate);

router.get('/', getBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.patch('/:id/payment', recordPayment);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

export default router;
