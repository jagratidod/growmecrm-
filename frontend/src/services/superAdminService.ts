import { request } from './api';
import type {
  SuperAdminDashboardData,
  Tenant,
  SubscriptionPlan,
  PlatformSettings,
  Announcement,
  AuditLogItem,
  WebhookServiceHealth,
  Pagination,
} from '../types/superAdmin.types';
import type { AuthResponse } from '../types/auth.types';

const base = '/super-admin';
const write = <T,>(path: string, method: string, data?: unknown) =>
  request<T>(base + path, { method, body: data === undefined ? undefined : JSON.stringify(data) });

export const superAdminService = {
  getDashboardStats: () => request<SuperAdminDashboardData>(base + '/dashboard/stats'),

  getTenants: (params: { search?: string; status?: string; plan?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '' && value !== 'ALL') query.set(key, String(value));
    }
    return request<{ tenants: Tenant[]; pagination: Pagination }>(base + '/tenants?' + query);
  },

  async updateTenantStatus(id: string, updates: Partial<Pick<Tenant, 'status' | 'plan' | 'maxSeats' | 'maxLeads'>>) {
    await write(`/tenants/${id}/status`, 'PUT', updates);
  },

  impersonateTenant: (id: string) => write<AuthResponse>(`/tenants/${id}/impersonate`, 'POST'),

  async getPlans(): Promise<SubscriptionPlan[]> {
    const { plans } = await request<{ plans: SubscriptionPlan[] }>(base + '/plans');
    return plans;
  },

  async updatePlan(id: string, updates: Partial<SubscriptionPlan>) {
    await write(`/plans/${id}`, 'PUT', updates);
  },

  async getSettings(): Promise<PlatformSettings> {
    const { settings } = await request<{ settings: PlatformSettings }>(base + '/settings');
    return settings;
  },

  async updateSettings(settings: Partial<PlatformSettings>) {
    await write('/settings', 'PUT', settings);
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const { announcements } = await request<{ announcements: Announcement[] }>(base + '/announcements');
    return announcements;
  },

  async createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    const { announcement } = await write<{ announcement: Announcement }>('/announcements', 'POST', data);
    return announcement;
  },

  async deleteAnnouncement(id: string) {
    await write(`/announcements/${id}`, 'DELETE');
  },

  getAuditLogs: (page = 1) =>
    request<{ logs: AuditLogItem[]; pagination: Pagination }>(base + '/audit-logs?page=' + page + '&limit=25'),

  async getWebhookHealth(): Promise<WebhookServiceHealth[]> {
    const { services } = await request<{ services: WebhookServiceHealth[] }>(base + '/webhooks/health');
    return services;
  },
};
