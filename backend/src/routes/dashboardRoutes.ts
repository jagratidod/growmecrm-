import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getDashboardSummary } from '../controllers/dashboardController';

const router = Router();

// Protect all dashboard endpoints with JWT tenant authentication
router.use(authenticate);

// GET /api/dashboard/summary - Complete real-time business intelligence summary
router.get('/summary', getDashboardSummary);

export default router;
