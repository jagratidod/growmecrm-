import { getCachedRead, request, ROUTE_READ_TTL, ROUTE_READ_STALE_WINDOW } from './api';

export interface FollowUpItem {
  id: string;
  leadId?: string;
  title?: string;
  leadName: string;
  phone: string;
  destination: string;
  dueDate: string;
  dueTime: string;
  type: 'call' | 'whatsapp' | 'email' | 'meeting' | 'follow-up';
  assignedTo?: string;
  assignedToName?: string;
  note: string;
  status: 'pending' | 'completed' | 'overdue';
  completedAt?: string;
  completedBy?: string;
}

export interface FollowUpStats {
  total: number;
  today: number;
  overdue: number;
  completed: number;
}

type FollowUpList = { followUps: FollowUpItem[]; stats: FollowUpStats }

export const followUpsService = {
  getCachedFollowUps: () => getCachedRead<FollowUpList>('/follow-ups', ROUTE_READ_STALE_WINDOW),
  // 1. Get all follow-ups with filter and stats
  async getFollowUps(params?: {
    filter?: 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
    search?: string;
  }, signal?: AbortSignal, fresh = false): Promise<FollowUpList> {
    const query = new URLSearchParams();
    if (params?.filter && params.filter !== 'all') query.append('filter', params.filter);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<FollowUpList>(`/follow-ups${qs}`, {
      method: 'GET', signal, fresh, cacheMs: ROUTE_READ_TTL,
    });
  },

  // 2. Create a new scheduled follow-up
  async createFollowUp(
    data: Omit<FollowUpItem, 'id' | 'status' | 'completedAt' | 'completedBy'>
  ): Promise<{ message: string; followUp: FollowUpItem }> {
    return request<{ message: string; followUp: FollowUpItem }>('/follow-ups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 3. Update follow-up details
  async updateFollowUp(
    id: string,
    updates: Partial<FollowUpItem>
  ): Promise<{ message: string; followUp: FollowUpItem }> {
    return request<{ message: string; followUp: FollowUpItem }>(`/follow-ups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // 4. Toggle completed status
  async toggleStatus(id: string): Promise<{ message: string; followUp: FollowUpItem }> {
    return request<{ message: string; followUp: FollowUpItem }>(`/follow-ups/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  // 5. Delete follow-up
  async deleteFollowUp(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/follow-ups/${id}`, {
      method: 'DELETE',
    });
  },
};
