import { createHash } from 'node:crypto';
import { ILead, Lead } from '../models/Lead';

export function intakeKey(namespace: string, value: string) {
  return namespace + ':' + createHash('sha256').update(value).digest('hex');
}

export async function saveIncomingLead(data: Partial<ILead>, key?: string) {
  if (!key) return { lead: await Lead.create(data), created: true };
  await Lead.init();
  const identity = { organizationId: data.organizationId, intakeKey: key };
  try {
    const result = await Lead.findOneAndUpdate(identity, { $setOnInsert: { ...data, intakeKey: key, createdAt: new Date(), updatedAt: new Date() } }, {
      upsert: true, new: true, includeResultMetadata: true, runValidators: true,
      timestamps: false,
    });
    if (!result.value) throw new Error('Lead intake returned no record');
    return { lead: result.value, created: !result.lastErrorObject?.updatedExisting };
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const lead = await Lead.findOne(identity);
    if (!lead) throw error;
    return { lead, created: false };
  }
}
