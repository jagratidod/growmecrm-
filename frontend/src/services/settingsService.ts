import { request } from './api';
import type {
  ChannelsSettings,
  AiAgentSettings,
  AutomationSettings,
  InvoiceDetailSettings,
} from '../context/SettingsContext';

export interface SettingsResponse {
  id: string;
  channels: ChannelsSettings;
  aiAgent: AiAgentSettings;
  automation: AutomationSettings;
  updatedAt?: string;
}

export const settingsService = {
  getInvoiceDetail() {
    return request<{ invoiceDetail: Partial<InvoiceDetailSettings> }>('/settings/invoice-detail');
  },

  updateInvoiceDetail(invoiceDetail: Partial<InvoiceDetailSettings>) {
    return request<{ invoiceDetail: Partial<InvoiceDetailSettings> }>('/settings/invoice-detail', {
      method: 'PUT',
      body: JSON.stringify({ invoiceDetail }),
    });
  },

  async getSettings(): Promise<SettingsResponse> {
    return request<SettingsResponse>('/settings');
  },

  async updateChannels(channels: ChannelsSettings): Promise<SettingsResponse> {
    return request<SettingsResponse>('/settings/channels', {
      method: 'PUT',
      body: JSON.stringify({ channels }),
    });
  },

  async updateAiAgent(aiAgent: AiAgentSettings): Promise<SettingsResponse> {
    return request<SettingsResponse>('/settings/ai-agent', {
      method: 'PUT',
      body: JSON.stringify({ aiAgent }),
    });
  },

  async updateAutomation(automation: AutomationSettings): Promise<SettingsResponse> {
    return request<SettingsResponse>('/settings/automation', {
      method: 'PUT',
      body: JSON.stringify({ automation }),
    });
  },
};
