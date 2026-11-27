import { PlatformSetting } from '../models/PlatformSetting';
import { decryptSecret } from './secrets';

interface PlatformState {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultTrialDays: number;
}

const TTL_MS = 15_000;
let cached: { value: PlatformState; at: number } | null = null;

/** Global platform flags, cached briefly so authenticate does not query on every request. */
export async function getPlatformState(): Promise<PlatformState> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value;
  const doc = await PlatformSetting.findOne().sort({ updatedAt: -1 })
    .select('maintenanceMode maintenanceMessage defaultTrialDays').lean();
  const value: PlatformState = {
    maintenanceMode: doc?.maintenanceMode ?? false,
    maintenanceMessage: doc?.maintenanceMessage || 'GrowMe CRM is undergoing scheduled maintenance. We will be back online shortly.',
    defaultTrialDays: doc?.defaultTrialDays ?? 0,
  };
  cached = { value, at: Date.now() };
  return value;
}

export type PlatformSecretField = 'razorpayKeySecret' | 'razorpayWebhookSecret' | 'stripeSecretKey' | 'smtpPassword';

/** The only way server code should read a stored platform secret; returns '' when unset. */
export async function readPlatformSecret(field: PlatformSecretField): Promise<string> {
  const doc = await PlatformSetting.findOne().sort({ updatedAt: -1 }).select(field).lean();
  return decryptSecret(doc?.[field]);
}

export const invalidatePlatformState = () => { cached = null; };
