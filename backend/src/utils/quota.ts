import { Types } from 'mongoose';
import { Organization } from '../models/Organization';
import { Lead } from '../models/Lead';

/** How many more leads this organization may store. Infinity when the org is unknown. */
export async function leadsRemaining(organizationId: string | Types.ObjectId | undefined): Promise<number> {
  if (!organizationId) return 0;
  const org = await Organization.findById(organizationId).select('maxLeads').lean();
  if (!org) return 0;
  const used = await Lead.countDocuments({ organizationId });
  return Math.max(0, (org.maxLeads ?? 500) - used);
}

export const leadQuotaMessage = 'Lead limit reached for your plan. Please upgrade to add more leads.';
