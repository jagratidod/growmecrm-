import { planModules } from '../platform/access';
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
    if (status) filter.status = status;
    if (plan) filter.plan = plan;
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

    if (status) organization.status = status;
    if (plan) organization.plan = plan;
    if (maxSeats !== undefined) organization.maxSeats = Number(maxSeats);
    if (maxLeads !== undefined) organization.maxLeads = Number(maxLeads);

    await organization.save();

    // Log this action into AuditLog
    await AuditLog.create({
      actorEmail: req.user?.email || 'superadmin@growmecrm.com',
      actorRole: req.user?.role || 'SUPER_ADMIN',
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
    const targetUser = await User.findOne({
      organizationId: organization._id,
      role: { $in: ['OWNER', 'ADMIN'] },
    }).sort({ role: 1 });

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
      actorEmail: req.user?.email || 'superadmin@growmecrm.com',
      actorRole: req.user?.role || 'SUPER_ADMIN',
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
    const plan = await SubscriptionPlan.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!plan) {
      res.status(404).json({ error: 'Subscription plan not found' });
      return;
    }

    await AuditLog.create({
      actorEmail: req.user?.email || 'superadmin@growmecrm.com',
      actorRole: req.user?.role || 'SUPER_ADMIN',
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
    res.status(200).json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching platform settings' });
  }
};

export const updatePlatformSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let settings = await PlatformSetting.findOne().sort({ updatedAt: -1 });
    if (!settings) {
      settings = new PlatformSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    await AuditLog.create({
      actorEmail: req.user?.email || 'superadmin@growmecrm.com',
      actorRole: req.user?.role || 'SUPER_ADMIN',
      action: 'UPDATE_PLATFORM_SETTINGS',
      details: `Updated global platform settings (Maintenance: ${settings.maintenanceMode})`,
      status: 'SUCCESS',
    });

    res.status(200).json({ message: 'Platform settings saved successfully', settings });
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
    if (!title?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Title and message are required' });
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
      actorEmail: req.user?.email || 'superadmin@growmecrm.com',
      actorRole: req.user?.role || 'SUPER_ADMIN',
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
    await PlatformAnnouncement.findByIdAndDelete(id);
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
export const getWebhookHealth = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      services: [
        {
          name: 'Meta Graph API (Facebook / Instagram)',
          endpoint: `${baseUrl}/api/webhooks/meta`,
          status: 'UNVERIFIED',
          latencyMs: null,
          lastReceived: null,
          description: 'Receives real-time lead submissions from Meta Lead Forms and IG Direct messages.',
        },
        {
          name: 'WhatsApp Cloud API Webhook',
          endpoint: `${baseUrl}/api/webhooks/whatsapp`,
          status: 'UNVERIFIED',
          latencyMs: null,
          lastReceived: null,
          description: 'Ingests inbound client messages and delivery receipts from WhatsApp Business.',
        },
        {
          name: 'Universal Multi-Channel Lead Ingestion',
          endpoint: `${baseUrl}/api/webhooks/lead`,
          status: 'UNVERIFIED',
          latencyMs: null,
          lastReceived: null,
          description: 'REST webhook receiver for website inquiry forms and external campaign landing pages.',
        },
      ],
      systemStatus: 'UNVERIFIED',
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error checking webhook health' });
  }
};
