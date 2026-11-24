import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getHostPage,
  updateHostPage,
  addReview,
  deleteReview,
  getPublicHostPage,
} from '../controllers/hostPageController';

const router = Router();

// Public unauthenticated route for external visitors & clients
router.get('/public/:slug', getPublicHostPage);

// Authenticated private routes for tenant host customization
router.get('/', authenticate, getHostPage);
router.put('/', authenticate, updateHostPage);
router.post('/reviews', authenticate, addReview);
router.delete('/reviews/:reviewId', authenticate, deleteReview);

export default router;
