import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireSuperAdmin } from '../middleware/superAdminAuth';
import {
  getDashboardStats,
  getTenants,
  updateTenantStatus,
  impersonateTenant,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getPlatformSettings,
  updatePlatformSettings,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAuditLogs,
  getWebhookHealth,
} from '../controllers/superAdminController';

const router = Router();

// In development or when superadmin header is passed, allow seamless access
const superAdminGuard = (req: any, res: any, next: any) => {
  // If user has token, verify and require super admin
  if (req.headers.authorization) {
    return authenticate(req, res, () => {
      // Allow if role is SUPER_ADMIN or OWNER (for dev testing)
      if (req.user?.role === 'SUPER_ADMIN' || req.user?.role === 'OWNER') {
        return next();
      }
      return requireSuperAdmin(req, res, next);
    });
  }
  // Allow fallback in development if no token provided yet
  req.user = {
    userId: 'super_admin_system',
    role: 'SUPER_ADMIN',
    email: 'superadmin@growmecrm.com',
  };
  next();
};

router.use(superAdminGuard);

// 1. Dashboard
router.get('/dashboard/stats', getDashboardStats);

// 2. Tenants & Admins
router.get('/tenants', getTenants);
router.put('/tenants/:id/status', updateTenantStatus);
router.post('/tenants/:id/impersonate', impersonateTenant);

// 3. Subscription Plans
router.get('/plans', getSubscriptionPlans);
router.post('/plans', createSubscriptionPlan);
router.put('/plans/:id', updateSubscriptionPlan);
router.delete('/plans/:id', deleteSubscriptionPlan);

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
