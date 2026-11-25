export interface TenantOwner {
  name: string;
  email: string;
  phone?: string;
  status?: string;
  lastActive?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: 'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM';
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED';
  maxSeats: number;
  maxLeads: number;
  leadCount: number;
  userCount: number;
  createdAt: string;
  owner?: TenantOwner | null;
}

export interface SuperAdminDashboardMetrics {
  totalAgencies: number;
  activeAgencies: number;
  suspendedAgencies: number;
  totalAdmins: number;
  totalLeads: number;
  mrr: number;
  arr: number;
  currency: string;
}

export interface SuperAdminDashboardData {
  metrics: SuperAdminDashboardMetrics;
  planDistribution: Record<string, number>;
  recentAgencies: any[];
  recentAudit: any[];
}

export interface SubscriptionPlan {
  _id?: string;
  id?: string;
  name: string;
  code: 'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM' | string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxSeats: number;
  maxLeads: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  contactPhone: string;
  defaultCurrency: string;
  defaultTrialDays: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowNewRegistrations: boolean;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  stripePublishableKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpFromEmail?: string;
}

export interface Announcement {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  targetAudience: 'ALL' | 'OWNERS' | 'AGENTS';
  active: boolean;
  expiresAt?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface AuditLogItem {
  _id?: string;
  id?: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetOrgName?: string;
  targetUserEmail?: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  createdAt: string;
}

export interface WebhookServiceHealth {
  name: string;
  endpoint: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  lastReceived: string;
  description: string;
}
