import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireSuperAdmin } from '../middleware/superAdminAuth';
import {
  getDashboardStats,
  getTenants,
  updateTenantStatus,
  impersonateTenant,
  getSubscriptionPlans,
  updateSubscriptionPlan,
  getPlatformSettings,
  updatePlatformSettings,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAuditLogs,
  getWebhookHealth,
} from '../controllers/superAdminController';

const router = Router();

router.use(authenticate, requireSuperAdmin);

// 1. Dashboard
router.get('/dashboard/stats', getDashboardStats);

// 2. Tenants & Admins
router.get('/tenants', getTenants);
router.put('/tenants/:id/status', updateTenantStatus);
router.post('/tenants/:id/impersonate', impersonateTenant);

// 3. Subscription Plans
router.get('/plans', getSubscriptionPlans);
router.put('/plans/:id', updateSubscriptionPlan);

// 4. Platform Settings
router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

// 5. Announcements / Broadcasts
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// 6. Security Audit Logs
router.get('/audit-logs', getAuditLogs);

// 7. Webhook & Service Health
router.get('/webhooks/health', getWebhookHealth);

export default router;
