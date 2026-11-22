import { Router } from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelCities,
} from '../controllers/hotelController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All hotel routes require authentication and tenant context
router.use(authenticate);

router.get('/cities', getHotelCities);
router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/', createHotel);
router.put('/:id', updateHotel);
router.delete('/:id', deleteHotel);

export default router;
