import { requireModule } from '../platform/access';
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
router.get('/', authenticate, requireModule('websites'), getHostPage);
router.put('/', authenticate, requireModule('websites'), updateHostPage);
router.post('/reviews', authenticate, requireModule('websites'), addReview);
router.delete('/reviews/:reviewId', authenticate, requireModule('websites'), deleteReview);

export default router;
