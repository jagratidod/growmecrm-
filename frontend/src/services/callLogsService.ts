import { request } from './api';
import type { CallLogEntry } from '../types/callLog.types';

export const callLogsService = {
  // 1. Fetch all call logs with user and search filters
  async getCallLogs(params?: {
    user?: string;
    searchLead?: string;
  }): Promise<{ callLogs: CallLogEntry[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.user && params.user !== 'All users') query.append('user', params.user);
    if (params?.searchLead) query.append('searchLead', params.searchLead);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ callLogs: CallLogEntry[]; count: number }>(`/call-logs${qs}`, {
      method: 'GET',
    });
  },

  // 2. Create a new call log entry
  async logCall(
    data: Omit<CallLogEntry, 'id' | 'createdAt'>
  ): Promise<{ message: string; callLog: CallLogEntry }> {
    return request<{ message: string; callLog: CallLogEntry }>('/call-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 3. Delete call log entry
  async deleteCallLog(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/call-logs/${id}`, {
      method: 'DELETE',
    });
  },
};
