import { NextFunction, Response } from 'express';
import { Organization } from '../models/Organization';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { AuthenticatedRequest } from '../types';
import { Workspace } from './models';

export const modules = ['leads', 'bookings', 'finance', 'catalog', 'communications', 'calendar', 'team', 'websites', 'pages', 'blog', 'media', 'seo'] as const;
export type Module = typeof modules[number];

const defaultModules: Record<string, readonly Module[]> = {
  STARTER: ['leads', 'team'],
  PRO: ['leads', 'bookings', 'finance', 'catalog', 'calendar', 'team', 'websites', 'pages', 'media'],
  ENTERPRISE: modules,
  CUSTOM: [],
};

export function planModules(code: string, features: string[] = []): readonly Module[] {
  const configured = features.filter((entry) => entry.startsWith('module:')).map((entry) => entry.slice(7));
  if (!features.includes('modules:configured') && !configured.length) return defaultModules[code] ?? [];
  return modules.filter((item) => configured.includes(item));
}

export async function workspaceAccess(organizationId: string) {
  const [organization, workspace] = await Promise.all([
    Organization.findById(organizationId),
    Workspace.findOne({ organizationId }).lean(),
  ]);
  if (!organization || organization.status === 'SUSPENDED') return null;
  const plan = await SubscriptionPlan.findOne({ code: organization.plan }).lean();
  const base = planModules(organization.plan, plan?.features);
  const enabled = new Set([...base, ...(workspace?.addOns ?? [])]);
  const paidThrough = workspace?.billing?.paidThrough;
  const today = new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);
  const expired = Boolean(paidThrough && paidThrough.toISOString().slice(0, 10) < today);
  return {
    organization,
    workspace,
    enabled: expired ? [] : modules.filter((name) => enabled.has(name)),
  };
}

export const requireModule = (...names: Module[]) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const access = req.user?.organizationId && await workspaceAccess(req.user.organizationId);
    if (!access || !names.every((name) => access.enabled.includes(name))) {
      res.status(403).json({ error: 'This module is outside your current GrowMe subscription.' });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};
