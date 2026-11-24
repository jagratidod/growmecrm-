import { request } from './api';

export interface CampaignItem {
  id: string;
  title: string;
  channel: 'whatsapp' | 'email';
  audience: string;
  message?: string;
  recipientCount: number;
  sentAt: string;
  status: 'sent' | 'scheduled' | 'draft';
  openRate: string;
  createdAt?: string;
}

export const campaignsService = {
  async getCampaigns(params?: {
    channel?: 'all' | 'whatsapp' | 'email';
    status?: string;
    search?: string;
  }): Promise<CampaignItem[]> {
    const query = new URLSearchParams();
    if (params?.channel && params.channel !== 'all') query.append('channel', params.channel);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    const url = `/campaigns${queryString ? `?${queryString}` : ''}`;
    return request<CampaignItem[]>(url);
  },

  async createCampaign(data: {
    title: string;
    channel: 'whatsapp' | 'email';
    audience: string;
    message?: string;
    recipientCount?: number;
    status?: 'sent' | 'scheduled' | 'draft';
  }): Promise<CampaignItem> {
    return request<CampaignItem>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteCampaign(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  },
};
