import { Router } from 'express';
import {
  registerAgency,
  login,
  getMe,
  getProfile,
  updateProfile,
  changePassword,
  acceptInvite,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Public auth endpoints
router.post('/register', registerAgency);
router.post('/login', login);
router.post('/accept-invite', acceptInvite);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Authenticated session & profile endpoints
router.get('/me', authenticate, getMe);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
