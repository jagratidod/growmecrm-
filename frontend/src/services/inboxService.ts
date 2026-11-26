import { request, ROUTE_READ_TTL } from './api';
import type { ChatConversation, ChannelType, ChatFilterType } from '../types/inbox.types';

export interface GetConversationsParams {
  channel?: ChannelType | 'all';
  search?: string;
  filter?: ChatFilterType;
  stage?: string;
}

export const inboxService = {
  async getConversations(params?: GetConversationsParams, signal?: AbortSignal, fresh = false): Promise<ChatConversation[]> {
    const query = new URLSearchParams({ summary: '1' });
    if (params?.channel && params.channel !== 'all') query.append('channel', params.channel);
    if (params?.search) query.append('search', params.search);
    if (params?.filter) query.append('filter', params.filter);
    if (params?.stage && params.stage !== 'All') query.append('stage', params.stage);

    const queryString = query.toString();
    const url = `/inbox${queryString ? `?${queryString}` : ''}`;
    return request<ChatConversation[]>(url, { signal, fresh, cacheMs: ROUTE_READ_TTL });
  },

  async getConversationById(id: string, signal?: AbortSignal): Promise<ChatConversation> {
    return request<ChatConversation>(`/inbox/${id}`, { signal });
  },

  async createConversation(data: {
    contactName: string;
    contactPhone?: string;
    contactHandle?: string;
    channel?: ChannelType;
    initialMessage?: string;
    assignedTo?: string;
  }): Promise<ChatConversation> {
    return request<ChatConversation>('/inbox', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async sendMessage(
    id: string,
    content: string,
    sender: 'contact' | 'agent' | 'system' = 'agent'
  ): Promise<{ message: any; conversation: ChatConversation }> {
    return request<{ message: any; conversation: ChatConversation }>(`/inbox/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, sender }),
    });
  },

  async toggleFavourite(id: string): Promise<ChatConversation> {
    return request<ChatConversation>(`/inbox/${id}/favourite`, {
      method: 'PATCH',
    });
  },

  async updateStage(id: string, stage: string): Promise<ChatConversation> {
    return request<ChatConversation>(`/inbox/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  },

  async deleteConversation(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/inbox/${id}`, {
      method: 'DELETE',
    });
  },

};
