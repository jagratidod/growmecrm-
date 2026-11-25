import type {
  SuperAdminDashboardData,
  Tenant,
  SubscriptionPlan,
  PlatformSettings,
  Announcement,
  AuditLogItem,
  WebhookServiceHealth,
} from '../types/superAdmin.types';

const API_BASE = '/api/super-admin';

// Local storage keys for caching and mock updates
const STORAGE_TENANTS_KEY = 'growme_superadmin_tenants';
const STORAGE_PLANS_KEY = 'growme_superadmin_plans';
const STORAGE_SETTINGS_KEY = 'growme_superadmin_settings';
const STORAGE_ANNOUNCEMENTS_KEY = 'growme_superadmin_announcements';
const STORAGE_AUDIT_KEY = 'growme_superadmin_audit_logs';

const DEFAULT_MOCK_TENANTS: Tenant[] = [
  {
    id: 'org_1',
    name: 'Treki Travels Pvt Ltd',
    slug: 'treki-travels',
    plan: 'PRO',
    status: 'ACTIVE',
    maxSeats: 10,
    maxLeads: 5000,
    leadCount: 428,
    userCount: 6,
    createdAt: '2026-10-08T10:30:00.000Z',
    owner: {
      name: 'Kushal Pareta',
      email: 'kushal@trekitravels.com',
      phone: '+91 98765 43210',
      status: 'Active',
      lastActive: '10 mins ago',
    },
  },
  {
    id: 'org_2',
    name: 'Wander & Co Expeditions',
    slug: 'wander-co',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    maxSeats: 50,
    maxLeads: 50000,
    leadCount: 2340,
    userCount: 18,
    createdAt: '2026-10-15T14:20:00.000Z',
    owner: {
      name: 'Rohit Deshmukh',
      email: 'rohit@wanderco.in',
      phone: '+91 98230 11223',
      status: 'Active',
      lastActive: '1 hour ago',
    },
  },
  {
    id: 'org_3',
    name: 'Himachal Trails Hub',
    slug: 'himachal-trails',
    plan: 'STARTER',
    status: 'TRIAL',
    maxSeats: 2,
    maxLeads: 500,
    leadCount: 89,
    userCount: 2,
    createdAt: '2026-11-18T09:15:00.000Z',
    owner: {
      name: 'Amit Thakur',
      email: 'amit@himachaltrails.com',
      phone: '+91 97112 34567',
      status: 'Active',
      lastActive: '3 hours ago',
    },
  },
  {
    id: 'org_4',
    name: 'Goa Coastal Getaways',
    slug: 'goa-coastal',
    plan: 'PRO',
    status: 'ACTIVE',
    maxSeats: 10,
    maxLeads: 5000,
    leadCount: 872,
    userCount: 5,
    createdAt: '2026-11-01T12:00:00.000Z',
    owner: {
      name: 'Pooja Fernandes',
      email: 'pooja@goacoastal.com',
      phone: '+91 88880 99990',
      status: 'Active',
      lastActive: 'Yesterday',
    },
  },
  {
    id: 'org_5',
    name: 'Kashmir Bliss Vacations',
    slug: 'kashmir-bliss',
    plan: 'STARTER',
    status: 'SUSPENDED',
    maxSeats: 2,
    maxLeads: 500,
    leadCount: 504,
    userCount: 2,
    createdAt: '2026-09-20T11:45:00.000Z',
    owner: {
      name: 'Bilal Mir',
      email: 'bilal@kashmirbliss.com',
      phone: '+91 94190 12345',
      status: 'Inactive',
      lastActive: '7 days ago',
    },
  },
];

const DEFAULT_MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'Starter Tier',
    code: 'STARTER',
    tagline: 'Ideal for independent travel agents and emerging boutique agencies.',
    priceMonthly: 1499,
    priceYearly: 14990,
    currency: 'INR',
    maxSeats: 2,
    maxLeads: 500,
    features: [
      'Up to 2 Team Members',
      '500 Leads Capacity',
      'Manual & Website Lead Ingestion',
      'Standard PDF Quotations',
      'Email Support (48h SLA)',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    id: 'plan_pro',
    name: 'Growth Pro',
    code: 'PRO',
    tagline: 'Best for growing tour operators and multi-channel travel desks.',
    priceMonthly: 3999,
    priceYearly: 39990,
    currency: 'INR',
    maxSeats: 10,
    maxLeads: 5000,
    features: [
      'Up to 10 Team Members',
      '5,000 Leads Capacity',
      'WhatsApp Cloud API Automation',
      'Instagram & Meta Lead Webhooks',
      'Automated Client Nudge Workflows',
      'Priority WhatsApp & Email Support',
    ],
    isPopular: true,
    isActive: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Agency',
    code: 'ENTERPRISE',
    tagline: 'For large destination management companies and franchise networks.',
    priceMonthly: 9999,
    priceYearly: 99990,
    currency: 'INR',
    maxSeats: 50,
    maxLeads: 50000,
    features: [
      'Unlimited Team Seats',
      '50,000+ Leads Capacity',
      'Custom Domain & Full White-labeling',
      'Dedicated Account Manager',
      'Custom Webhook Integrations & Zapier',
      '99.9% Uptime Guarantee & SLA',
    ],
    isPopular: false,
    isActive: true,
  },
];

const DEFAULT_MOCK_SETTINGS: PlatformSettings = {
  platformName: 'GrowMe CRM',
  supportEmail: 'support@growmecrm.com',
  contactPhone: '+91 89822 92201',
  defaultCurrency: 'INR',
  defaultTrialDays: 14,
  maintenanceMode: false,
  maintenanceMessage: 'GrowMe CRM is undergoing scheduled maintenance. We will be back online shortly.',
  allowNewRegistrations: true,
  razorpayKeyId: 'rzp_live_9a7xKq12mP0',
  stripePublishableKey: 'pk_live_51Pxxxxxxx',
  smtpHost: 'smtp.sendgrid.net',
  smtpPort: 587,
  smtpUser: 'apikey',
  smtpFromEmail: 'notifications@growmecrm.com',
};

const DEFAULT_MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: '🚀 Multi-Channel Webhook Ingestion Live!',
    message: 'All workspaces now have access to automated WhatsApp, Meta, and Website webhook URLs in Settings > Channels.',
    type: 'success',
    targetAudience: 'ALL',
    active: true,
    createdAt: '2026-11-25T08:00:00.000Z',
    createdBy: 'Super Admin',
  },
  {
    id: 'ann_2',
    title: '⚡ Scheduled Database Optimization (Sunday 2:00 AM)',
    message: 'Brief 10-minute maintenance window for read replica scaling this Sunday.',
    type: 'info',
    targetAudience: 'ALL',
    active: true,
    createdAt: '2026-11-24T16:00:00.000Z',
    createdBy: 'Super Admin',
  },
];

const DEFAULT_MOCK_AUDIT: AuditLogItem[] = [
  {
    id: 'log_1',
    actorEmail: 'superadmin@growmecrm.com',
    actorRole: 'SUPER_ADMIN',
    action: 'UPGRADE_PLAN',
    targetOrgName: 'Wander & Co Expeditions',
    details: 'Upgraded subscription tier to ENTERPRISE (₹9,999/mo)',
    status: 'SUCCESS',
    createdAt: '2026-11-25T13:45:00.000Z',
  },
  {
    id: 'log_2',
    actorEmail: 'superadmin@growmecrm.com',
    actorRole: 'SUPER_ADMIN',
    action: 'UPDATE_SETTINGS',
    details: 'Saved updated Razorpay live credentials and webhook secret',
    status: 'SUCCESS',
    createdAt: '2026-11-25T12:30:00.000Z',
  },
  {
    id: 'log_3',
    actorEmail: 'superadmin@growmecrm.com',
    actorRole: 'SUPER_ADMIN',
    action: 'SUSPEND_TENANT',
    targetOrgName: 'Kashmir Bliss Vacations',
    details: 'Account suspended due to 14 days overdue subscription renewal',
    status: 'WARNING',
    createdAt: '2026-11-25T11:00:00.000Z',
  },
  {
    id: 'log_4',
    actorEmail: 'superadmin@growmecrm.com',
    actorRole: 'SUPER_ADMIN',
    action: 'CREATE_ANNOUNCEMENT',
    details: 'Broadcasted announcement: "Multi-Channel Webhook Ingestion Live!"',
    status: 'SUCCESS',
    createdAt: '2026-11-25T08:05:00.000Z',
  },
];

function getStoredOr<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}
  return fallback;
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export const superAdminService = {
  // 1. Get Dashboard Aggregates
  async getDashboardStats(): Promise<SuperAdminDashboardData> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // Mock fallback
    const tenants = getStoredOr(STORAGE_TENANTS_KEY, DEFAULT_MOCK_TENANTS);
    const audit = getStoredOr(STORAGE_AUDIT_KEY, DEFAULT_MOCK_AUDIT);

    const activeAgencies = tenants.filter((t) => t.status === 'ACTIVE').length;
    const suspendedAgencies = tenants.filter((t) => t.status === 'SUSPENDED').length;
    const totalLeads = tenants.reduce((acc, t) => acc + (t.leadCount || 0), 0);
    const totalAdmins = tenants.length;

    const planDistribution: Record<string, number> = { STARTER: 0, PRO: 0, ENTERPRISE: 0, CUSTOM: 0 };
    tenants.forEach((t) => {
      planDistribution[t.plan] = (planDistribution[t.plan] || 0) + 1;
    });

    const mrr =
      (planDistribution.STARTER || 0) * 1499 +
      (planDistribution.PRO || 0) * 3999 +
      (planDistribution.ENTERPRISE || 0) * 9999;

    return {
      metrics: {
        totalAgencies: tenants.length,
        activeAgencies,
        suspendedAgencies,
        totalAdmins,
        totalLeads,
        mrr,
        arr: mrr * 12,
        currency: 'INR',
      },
      planDistribution,
      recentAgencies: tenants.slice(0, 5),
      recentAudit: audit.slice(0, 5),
    };
  },

  // 2. Tenants & Admins Directory
  async getTenants(): Promise<Tenant[]> {
    try {
      const res = await fetch(`${API_BASE}/tenants`);
      if (res.ok) {
        const data = await res.json();
        if (data?.tenants?.length > 0) return data.tenants;
      }
    } catch {}

    return getStoredOr(STORAGE_TENANTS_KEY, DEFAULT_MOCK_TENANTS);
  },

  async updateTenantStatus(
    id: string,
    updates: Partial<{ status: string; plan: string; maxSeats: number; maxLeads: number }>
  ): Promise<void> {
    try {
      await fetch(`${API_BASE}/tenants/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}

    const tenants = getStoredOr(STORAGE_TENANTS_KEY, DEFAULT_MOCK_TENANTS);
    const updated = tenants.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setStored(STORAGE_TENANTS_KEY, updated);

    // Add audit log
    const audit = getStoredOr(STORAGE_AUDIT_KEY, DEFAULT_MOCK_AUDIT);
    const target = tenants.find((t) => t.id === id);
    audit.unshift({
      id: 'log_' + Date.now(),
      actorEmail: 'superadmin@growmecrm.com',
      actorRole: 'SUPER_ADMIN',
      action: 'UPDATE_TENANT',
      targetOrgName: target?.name,
      details: `Updated workspace: ${JSON.stringify(updates)}`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    });
    setStored(STORAGE_AUDIT_KEY, audit);
  },

  async impersonateTenant(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/tenants/${id}/impersonate`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}

    const tenants = getStoredOr(STORAGE_TENANTS_KEY, DEFAULT_MOCK_TENANTS);
    const tenant = tenants.find((t) => t.id === id);
    if (!tenant) throw new Error('Tenant not found');

    const mockUser = {
      id: 'usr_owner_' + tenant.id,
      name: tenant.owner?.name || 'Workspace Owner',
      email: tenant.owner?.email || 'owner@agency.com',
      role: 'owner',
      organizationId: tenant.id,
      organizationName: tenant.name,
      memberSince: '1 Oct 2026',
      lastSignIn: 'Just now',
    };

    localStorage.setItem('crm_auth_token', 'jwt_impersonated_' + Date.now());
    localStorage.setItem('crm_auth_user', JSON.stringify(mockUser));
    localStorage.setItem('crm_current_agency', tenant.name);

    return { user: mockUser, token: 'jwt_impersonated_' + Date.now() };
  },

  // 3. Subscription Plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const res = await fetch(`${API_BASE}/plans`);
      if (res.ok) {
        const data = await res.json();
        if (data?.plans?.length > 0) return data.plans;
      }
    } catch {}

    return getStoredOr(STORAGE_PLANS_KEY, DEFAULT_MOCK_PLANS);
  },

  async updatePlan(id: string, updates: Partial<SubscriptionPlan>): Promise<void> {
    try {
      await fetch(`${API_BASE}/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}

    const plans = getStoredOr(STORAGE_PLANS_KEY, DEFAULT_MOCK_PLANS);
    const updated = plans.map((p) => ((p.id === id || p._id === id) ? { ...p, ...updates } : p));
    setStored(STORAGE_PLANS_KEY, updated);
  },

  // 4. Platform Settings
  async getSettings(): Promise<PlatformSettings> {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data?.settings) return data.settings;
      }
    } catch {}

    return getStoredOr(STORAGE_SETTINGS_KEY, DEFAULT_MOCK_SETTINGS);
  },

  async updateSettings(settings: Partial<PlatformSettings>): Promise<void> {
    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch {}

    const current = getStoredOr(STORAGE_SETTINGS_KEY, DEFAULT_MOCK_SETTINGS);
    const updated = { ...current, ...settings };
    setStored(STORAGE_SETTINGS_KEY, updated);
  },

  // 5. Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      if (res.ok) {
        const data = await res.json();
        if (data?.announcements?.length > 0) return data.announcements;
      }
    } catch {}

    return getStoredOr(STORAGE_ANNOUNCEMENTS_KEY, DEFAULT_MOCK_ANNOUNCEMENTS);
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    try {
      const res = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.announcement) return data.announcement;
      }
    } catch {}

    const newAnn: Announcement = {
      ...announcement,
      id: 'ann_' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: 'Super Admin',
      active: true,
    };
    const list = getStoredOr(STORAGE_ANNOUNCEMENTS_KEY, DEFAULT_MOCK_ANNOUNCEMENTS);
    list.unshift(newAnn);
    setStored(STORAGE_ANNOUNCEMENTS_KEY, list);
    return newAnn;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/announcements/${id}`, { method: 'DELETE' });
    } catch {}

    const list = getStoredOr(STORAGE_ANNOUNCEMENTS_KEY, DEFAULT_MOCK_ANNOUNCEMENTS);
    const updated = list.filter((a) => a.id !== id && a._id !== id);
    setStored(STORAGE_ANNOUNCEMENTS_KEY, updated);
  },

  // 6. Audit Logs
  async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/audit-logs`);
      if (res.ok) {
        const data = await res.json();
        if (data?.logs?.length > 0) return data.logs;
      }
    } catch {}

    return getStoredOr(STORAGE_AUDIT_KEY, DEFAULT_MOCK_AUDIT);
  },

  // 7. Webhook Health Monitor
  async getWebhookHealth(): Promise<WebhookServiceHealth[]> {
    try {
      const res = await fetch(`${API_BASE}/webhooks/health`);
      if (res.ok) {
        const data = await res.json();
        if (data?.services) return data.services;
      }
    } catch {}

    const host = window.location.origin;
    return [
      {
        name: 'Meta Graph API (Facebook / Instagram)',
        endpoint: `${host}/api/webhooks/meta`,
        status: 'OPERATIONAL',
        latencyMs: 124,
        lastReceived: '3 mins ago',
        description: 'Receives real-time lead submissions from Meta Lead Forms and IG Direct messages.',
      },
      {
        name: 'WhatsApp Cloud API Webhook',
        endpoint: `${host}/api/webhooks/whatsapp`,
        status: 'OPERATIONAL',
        latencyMs: 82,
        lastReceived: '1 min ago',
        description: 'Ingests inbound client messages and delivery receipts from WhatsApp Business.',
      },
      {
        name: 'Universal Multi-Channel Lead Ingestion',
        endpoint: `${host}/api/webhooks/lead`,
        status: 'OPERATIONAL',
        latencyMs: 38,
        lastReceived: 'Just now',
        description: 'REST webhook receiver for website inquiry forms and external campaign landing pages.',
      },
    ];
  },
};
