import { request } from './api';

export interface OrganizationSettings {
  id: string;
  agencyName: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  plan?: string;
  maxSeats?: number;
  maxLeads?: number;
}

export const organizationService = {
  // 1. Get current agency branding
  async getOrganization(): Promise<OrganizationSettings> {
    return request<OrganizationSettings>('/organization', { method: 'GET' });
  },

  // 2. Update branding (Owner/Admin)
  async updateOrganization(data: Partial<OrganizationSettings>): Promise<{ message: string; organization: OrganizationSettings }> {
    return request<{ message: string; organization: OrganizationSettings }>('/organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
