import { planModules } from '../platform/access';
import { getPlatformState, invalidatePlatformState } from '../utils/platformState';
import { encryptSecret, hasEncryptionKey, isEncryptedSecret } from '../utils/secrets';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../types';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { Lead } from '../models/Lead';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { PlatformSetting } from '../models/PlatformSetting';
import { PlatformAnnouncement } from '../models/PlatformAnnouncement';
import { AuditLog } from '../models/AuditLog';

// Keep editable plan records available without assigning subscription prices.
const ensurePlans = async () => {
  const defaults = [
    { name: 'Starter', code: 'STARTER', maxSeats: 2, maxLeads: 500 },
    { name: 'Pro', code: 'PRO', maxSeats: 10, maxLeads: 5000 },
    { name: 'Enterprise', code: 'ENTERPRISE', maxSeats: 50, maxLeads: 50000 },
  ] as const;
  await SubscriptionPlan.bulkWrite(defaults.map((plan) => ({
    updateOne: { filter: { code: plan.code }, update: { $setOnInsert: plan }, upsert: true },
  })));
};

const STATUSES = ['ACTIVE', 'SUSPENDED', 'TRIAL'];
const PLANS = ['STARTER', 'PRO', 'ENTERPRISE', 'CUSTOM'];
const SECRET_FIELDS = ['razorpayKeySecret', 'razorpayWebhookSecret', 'stripeSecretKey', 'smtpPassword'] as const;
const TEXT_FIELDS = ['platformName', 'supportEmail', 'contactPhone', 'defaultCurrency', 'maintenanceMessage',
  'razorpayKeyId', 'stripePublishableKey', 'smtpHost', 'smtpUser', 'smtpFromEmail'] as const;
const intIn = (value: unknown, min: number, max: number) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};
const actor = (req: AuthenticatedRequest) => ({
  actorEmail: req.user?.email || 'superadmin@growmecrm.com',
  actorRole: req.user?.role || 'SUPER_ADMIN',
  ipAddress: req.ip || '',
});

// Secrets saved before encryption existed are sealed the next time settings are read (needs GROWME_CONNECTION_KEY).
export async function encryptLegacySecrets(settings: any): Promise<void> {
  if (!hasEncryptionKey()) return;
  let changed = false;
  for (const key of SECRET_FIELDS) {
    const value = settings.get ? settings.get(key) : settings[key];
    if (value && !isEncryptedSecret(value)) {
      settings.set(key, encryptSecret(value));
      changed = true;
    }
  }
  if (changed) await settings.save();
}

// Secrets are write-only: the API reports whether one is set, never its value.
const publicSettings = (doc: any) => {
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  const secretsSet: Record<string, boolean> = {};
  for (const key of SECRET_FIELDS) {
    secretsSet[key] = Boolean(plain[key]);
    delete plain[key];
  }
  return { ...plain, secretsSet };
};

// 1. GET SUPER ADMIN DASHBOARD KPIS
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await ensurePlans();

    const [totalAgencies, activeAgencies, suspendedAgencies, totalAdmins, totalLeads] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ status: 'ACTIVE' }),
      Organization.countDocuments({ status: 'SUSPENDED' }),
      User.countDocuments({ role: { $in: ['OWNER', 'ADMIN'] } }),
      Lead.countDocuments(),
    ]);

    // Aggregate Plan Distribution
    const planAgg = await Organization.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } },
    ]);
    const planDistribution: Record<string, number> = {
      STARTER: 0,
      PRO: 0,
      ENTERPRISE: 0,
      CUSTOM: 0,
    };
    planAgg.forEach((item) => {
      if (item._id && planDistribution[item._id] !== undefined) {
        planDistribution[item._id] = item.count;
      }
    });

    const [planPrices, activePlans] = await Promise.all([
      SubscriptionPlan.find().select('code priceMonthly').lean(),
      Organization.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
    ]);
    const prices = new Map<string, number>(planPrices.map((plan) => [plan.code, plan.priceMonthly]));
    const mrr = activePlans.reduce((sum, plan) => sum + plan.count * (prices.get(plan._id) ?? 0), 0);
    const recentAgencies = await Organization.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent 5 audit logs
    const recentAudit = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      metrics: {
        totalAgencies,
        activeAgencies,
        suspendedAgencies,
        totalAdmins,
        totalLeads,
        mrr,
        arr: mrr * 12,
        currency: 'INR',
      },
      planDistribution,
      recentAgencies,
      recentAudit,
    });
  } catch (error: any) {
    console.error('Super Admin Dashboard Error:', error);
    res.status(500).json({ error: error.message || 'Error fetching dashboard stats' });
  }
};

// 2. GET ALL TENANTS / AGENCIES DIRECTORY (Paginated with search)
export const getTenants = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search = '', status, plan, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));

    const filter: any = {};
    if (typeof status === 'string' && STATUSES.includes(status)) filter.status = status;
    if (typeof plan === 'string' && PLANS.includes(plan)) filter.plan = plan;
    if (search) {
      const text = String(search).slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(text, 'i');
      const owners = await User.find({ role: 'OWNER', email: pattern }).distinct('organizationId');
      filter.$or = [{ name: pattern }, { slug: pattern }, { _id: { $in: owners } }];
    }

    const [total, organizations] = await Promise.all([
      Organization.countDocuments(filter),
      Organization.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    ]);

    const ids = organizations.map((org) => org._id);
    const [owners, leadsByOrg, usersByOrg] = ids.length ? await Promise.all([
      User.aggregate([
        { $match: { organizationId: { $in: ids }, role: 'OWNER' } },
        { $sort: { _id: 1 } },
        { $group: { _id: '$organizationId', owner: { $first: {
          name: '$name', email: '$email', phone: '$phone', status: '$status', lastActive: '$lastActive',
        } } } },
      ]),
      Lead.aggregate([
        { $match: { organizationId: { $in: ids } } },
        { $group: { _id: '$organizationId', count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { organizationId: { $in: ids } } },
        { $group: { _id: '$organizationId', count: { $sum: 1 } } },
      ]),
    ]) : [[], [], []];

    const ownersById = new Map(owners.map(({ _id, owner }) => [String(_id), owner]));
    const leadCounts = new Map(leadsByOrg.map(({ _id, count }) => [String(_id), count]));
    const userCounts = new Map(usersByOrg.map(({ _id, count }) => [String(_id), count]));
    const enrichedTenants = organizations.map((org) => {
      const id = org._id.toString();
      return {
        id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logoUrl || '',
        plan: org.plan || 'STARTER',
        status: org.status || 'ACTIVE',
        maxSeats: org.maxSeats || 2,
        maxLeads: org.maxLeads || 500,
        leadCount: leadCounts.get(id) ?? 0,
        userCount: userCounts.get(id) ?? 0,
        createdAt: org.createdAt,
        owner: ownersById.get(id) ?? null,
      };
    });

    res.status(200).json({
      tenants: enrichedTenants,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('Super Admin Get Tenants Error:', error);
    res.status(500).json({ error: error.message || 'Error fetching tenants list' });
  }
};

// 3. UPDATE TENANT STATUS & PLAN QUOTAS
export const updateTenantStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, plan, maxSeats, maxLeads } = req.body;

    const organization = await Organization.findById(id);
    if (!organization) {
      res.status(404).json({ error: 'Tenant workspace not found' });
      return;
    }

    const previousStatus = organization.status;
    const previousPlan = organization.plan;

    if (status !== undefined && !STATUSES.includes(status)) {
      res.status(400).json({ error: 'Choose a valid workspace status.' });
      return;
    }
    if (plan !== undefined && !PLANS.includes(plan)) {
      res.status(400).json({ error: 'Choose a valid subscription plan.' });
      return;
    }
    const seats = maxSeats === undefined ? undefined : intIn(maxSeats, 1, 100000);
    const leadCap = maxLeads === undefined ? undefined : intIn(maxLeads, 1, 100000000);
    if (seats === null || leadCap === null) {
      res.status(400).json({ error: 'Seats and lead limits must be whole numbers of at least 1.' });
      return;
    }

    if (status) {
      if (status === 'TRIAL' && previousStatus !== 'TRIAL') {
        const { defaultTrialDays } = await getPlatformState();
        organization.trialEndsAt = new Date(Date.now() + (defaultTrialDays || 14) * 86_400_000);
      } else if (status === 'ACTIVE') {
        organization.trialEndsAt = undefined;
      }
      organization.status = status;
    }
    if (plan) organization.plan = plan;
    if (seats !== undefined) organization.maxSeats = seats;
    if (leadCap !== undefined) organization.maxLeads = leadCap;

    await organization.save();

    // Log this action into AuditLog
    await AuditLog.create({
      ...actor(req),
      action: 'UPDATE_TENANT',
      targetOrgName: organization.name,
      targetOrgId: organization._id.toString(),
      details: `Updated ${organization.name}: Status (${previousStatus} -> ${organization.status}), Plan (${previousPlan} -> ${organization.plan}), MaxSeats: ${organization.maxSeats}, MaxLeads: ${organization.maxLeads}`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      message: `Tenant "${organization.name}" updated successfully`,
      organization,
    });
  } catch (error: any) {
    console.error('Update Tenant Error:', error);
    res.status(500).json({ error: error.message || 'Error updating tenant' });
  }
};

// 4. IMPERSONATE TENANT (Support 1-Click Login As Admin)
export const impersonateTenant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);
    if (!organization) {
      res.status(404).json({ error: 'Target agency not found' });
      return;
    }

    // Find the owner or active admin of the workspace
    const targetUser = await User.findOne({ organizationId: organization._id, role: 'OWNER', status: 'Active' }) ??
      await User.findOne({ organizationId: organization._id, role: 'ADMIN', status: 'Active' });

    if (!targetUser) {
      res.status(404).json({ error: 'No active admin found in this workspace to impersonate.' });
      return;
    }

    const secret = process.env.JWT_SECRET!;
    // Short-lived 3-hour impersonation session
    const token = jwt.sign(
      {
        userId: targetUser._id.toString(),
        organizationId: organization._id.toString(),
        role: targetUser.role,
        email: targetUser.email,
        name: targetUser.name,
        isImpersonated: true,
        impersonatedBy: req.user?.email || 'superadmin@growmecrm.com',
      },
      secret,
      { expiresIn: '3h' }
    );

    // Audit Log
    await AuditLog.create({
      ...actor(req),
      action: 'IMPERSONATE_ADMIN',
      targetOrgName: organization.name,
      targetOrgId: organization._id.toString(),
      targetUserEmail: targetUser.email,
      details: `Super Admin impersonated workspace "${organization.name}" (${targetUser.email})`,
      status: 'WARNING',
    });

    res.status(200).json({
      message: `Impersonation session created for ${organization.name}`,
      token,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role.toLowerCase(),
        organizationId: organization._id,
        organizationName: organization.name,
      },
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
        plan: organization.plan,
      },
    });
  } catch (error: any) {
    console.error('Impersonate Tenant Error:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize impersonation session' });
  }
};

// 5. GET & UPDATE SUBSCRIPTION PLANS
export const getSubscriptionPlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await ensurePlans();
    const plans = await SubscriptionPlan.find().sort({ priceMonthly: 1 }).lean();
    res.status(200).json({ plans: plans.map((plan) => ({ ...plan, modules: planModules(plan.code, plan.features) })) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching subscription plans' });
  }
};

export const updateSubscriptionPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};
    const updates: Record<string, unknown> = {};
    for (const key of ['priceMonthly', 'priceYearly'] as const) {
      if (body[key] === undefined) continue;
      const n = Number(body[key]);
      if (!Number.isFinite(n) || n < 0) { res.status(400).json({ error: 'Prices must be zero or more.' }); return; }
      updates[key] = n;
    }
    for (const key of ['maxSeats', 'maxLeads'] as const) {
      if (body[key] === undefined) continue;
      const n = intIn(body[key], 1, 100000000);
      if (n === null) { res.status(400).json({ error: 'Seats and leads must be whole numbers of at least 1.' }); return; }
      updates[key] = n;
    }
    if (body.tagline !== undefined) updates.tagline = String(body.tagline).slice(0, 200);
    if (body.name !== undefined && String(body.name).trim()) updates.name = String(body.name).trim().slice(0, 80);
    for (const key of ['isPopular', 'isActive'] as const) if (typeof body[key] === 'boolean') updates[key] = body[key];
    if (body.features !== undefined) {
      if (!Array.isArray(body.features) || body.features.some((f: unknown) => typeof f !== 'string' || f.length > 200)) {
        res.status(400).json({ error: 'Features must be a list of short text values.' });
        return;
      }
      updates.features = body.features;
    }
    const plan = await SubscriptionPlan.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!plan) {
      res.status(404).json({ error: 'Subscription plan not found' });
      return;
    }

    await AuditLog.create({
      ...actor(req),
      action: 'UPDATE_PLAN',
      details: `Updated plan ${plan.name} (${plan.code}) price: ₹${plan.priceMonthly}/mo`,
      status: 'SUCCESS',
    });

    res.status(200).json({ message: 'Plan updated successfully', plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating plan' });
  }
};

// 6. GET & UPDATE PLATFORM SETTINGS
export const getPlatformSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const settings = await PlatformSetting.findOne().sort({ updatedAt: -1 }) ??
      await PlatformSetting.create({});
    await encryptLegacySecrets(settings);
    res.status(200).json({ settings: publicSettings(settings) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching platform settings' });
  }
};

export const updatePlatformSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body ?? {};
    const updates: Record<string, unknown> = {};
    for (const key of TEXT_FIELDS) {
      if (body[key] === undefined) continue;
      if (typeof body[key] !== 'string' || body[key].length > 500) {
        res.status(400).json({ error: `Enter valid text for ${key}.` });
        return;
      }
      updates[key] = body[key].trim();
    }
    // A blank secret means "keep the stored value".
    for (const key of SECRET_FIELDS) {
      if (typeof body[key] === 'string' && body[key].trim()) {
        if (!hasEncryptionKey()) {
          res.status(503).json({ error: 'Secrets cannot be saved until GROWME_CONNECTION_KEY is configured on the server.' });
          return;
        }
        updates[key] = encryptSecret(body[key].trim());
      }
    }
    for (const key of ['maintenanceMode', 'allowNewRegistrations'] as const) {
      if (body[key] === undefined) continue;
      if (typeof body[key] !== 'boolean') { res.status(400).json({ error: `${key} must be true or false.` }); return; }
      updates[key] = body[key];
    }
    if (body.defaultTrialDays !== undefined) {
      const days = intIn(body.defaultTrialDays, 0, 90);
      if (days === null) { res.status(400).json({ error: 'Trial days must be between 0 and 90.' }); return; }
      updates.defaultTrialDays = days;
    }
    if (body.smtpPort !== undefined) {
      const port = intIn(body.smtpPort, 1, 65535);
      if (port === null) { res.status(400).json({ error: 'SMTP port must be between 1 and 65535.' }); return; }
      updates.smtpPort = port;
    }
    let settings = await PlatformSetting.findOne().sort({ updatedAt: -1 });
    if (!settings) settings = new PlatformSetting(updates);
    else settings.set(updates);
    await settings.save();
    invalidatePlatformState();

    await AuditLog.create({
      ...actor(req),
      action: 'UPDATE_PLATFORM_SETTINGS',
      details: `Updated global platform settings (Maintenance: ${settings.maintenanceMode})`,
      status: 'SUCCESS',
    });

    res.status(200).json({ message: 'Platform settings saved successfully', settings: publicSettings(settings) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error saving platform settings' });
  }
};

// 7. ANNOUNCEMENTS (BROADCASTS)
export const getAnnouncements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const announcements = await PlatformAnnouncement.find().sort({ createdAt: -1 });
    res.status(200).json({ announcements });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching announcements' });
  }
};

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, message, type = 'info', targetAudience = 'ALL', expiresAt } = req.body;
    if (typeof title !== 'string' || typeof message !== 'string' || !title.trim() || !message.trim()) {
      res.status(400).json({ error: 'Title and message are required' });
      return;
    }
    if (!['info', 'warning', 'success', 'critical'].includes(type) || !['ALL', 'OWNERS', 'AGENTS'].includes(targetAudience)) {
      res.status(400).json({ error: 'Choose a valid announcement type and audience.' });
      return;
    }
    if (expiresAt && Number.isNaN(new Date(expiresAt).getTime())) {
      res.status(400).json({ error: 'Enter a valid expiry date.' });
      return;
    }

    const announcement = await PlatformAnnouncement.create({
      title: title.trim(),
      message: message.trim(),
      type,
      targetAudience,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: req.user?.email || 'Super Admin',
      active: true,
    });

    await AuditLog.create({
      ...actor(req),
      action: 'CREATE_ANNOUNCEMENT',
      details: `Broadcasted announcement: "${announcement.title}" (${announcement.type})`,
      status: 'SUCCESS',
    });

    res.status(201).json({ message: 'Announcement broadcasted successfully', announcement });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating announcement' });
  }
};

export const deleteAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const removed = await PlatformAnnouncement.findByIdAndDelete(id);
    if (!removed) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }
    await AuditLog.create({ ...actor(req), action: 'DELETE_ANNOUNCEMENT', details: `Deleted announcement: "${removed.title}"`, status: 'SUCCESS' });
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error deleting announcement' });
  }
};

// 8. AUDIT LOGS
export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 25));

    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching audit logs' });
  }
};

// 9. WEBHOOK HEALTH MONITOR
// Status comes from real data: whether the provider is configured and when a lead last arrived through it.
export const getWebhookHealth = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const DAY = 86_400_000;

    const latest = async (sources: string[]) => {
      const lead = await Lead.findOne({ source: { $in: sources } }).sort({ createdAt: -1 }).select('createdAt').lean();
      return lead?.createdAt ? new Date(lead.createdAt) : null;
    };
    const [meta, whatsapp, website] = await Promise.all([
      latest(['Facebook', 'Instagram']),
      latest(['WhatsApp']),
      latest(['Website']),
    ]);

    const describe = (configured: boolean, lastReceived: Date | null) => {
      const status: 'OPERATIONAL' | 'DEGRADED' | 'UNVERIFIED' =
        !configured || !lastReceived ? 'UNVERIFIED' : Date.now() - lastReceived.getTime() <= 7 * DAY ? 'OPERATIONAL' : 'DEGRADED';
      return { status, lastReceived: lastReceived ? lastReceived.toISOString() : null, latencyMs: null };
    };

    const services = [
      {
        name: 'Meta Graph API (Facebook / Instagram)',
        endpoint: `${baseUrl}/api/webhooks/meta`,
        ...describe(Boolean(process.env.META_APP_SECRET && process.env.META_VERIFY_TOKEN), meta),
        description: process.env.META_APP_SECRET && process.env.META_VERIFY_TOKEN
          ? 'Receives real-time lead submissions from Meta Lead Forms and IG Direct messages.'
          : 'META_VERIFY_TOKEN and META_APP_SECRET must both be set on the server; until then Meta verification is refused.',
      },
      {
        name: 'WhatsApp Cloud API Webhook',
        endpoint: `${baseUrl}/api/webhooks/whatsapp`,
        ...describe(Boolean(process.env.WHATSAPP_VERIFY_TOKEN && process.env.META_APP_SECRET), whatsapp),
        description: process.env.WHATSAPP_VERIFY_TOKEN && process.env.META_APP_SECRET
          ? 'Ingests inbound client messages and delivery receipts from WhatsApp Business.'
          : 'WHATSAPP_VERIFY_TOKEN and META_APP_SECRET must both be set on the server; until then WhatsApp verification is refused.',
      },
      {
        name: 'Universal Multi-Channel Lead Ingestion',
        endpoint: `${baseUrl}/api/webhooks/lead`,
        ...describe(true, website),
        description: 'REST webhook receiver for website inquiry forms and external campaign landing pages.',
      },
    ];

    const rank = { OPERATIONAL: 0, UNVERIFIED: 1, DEGRADED: 2 } as const;
    const systemStatus = services.reduce<keyof typeof rank>((worst, s) => rank[s.status] > rank[worst] ? s.status : worst, 'OPERATIONAL');

    res.status(200).json({ services, systemStatus, checkedAt: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error checking webhook health' });
  }
};
