import { request } from './api';
import type { SightseeingActivity } from '../types/sightseeing.types';

export const sightseeingService = {
  // 1. Get all activities (with optional search query)
  async getActivities(params?: { search?: string }): Promise<{
    activities: SightseeingActivity[];
    total: number;
  }> {
    const query = new URLSearchParams();
    if (params?.search?.trim()) {
      query.append('search', params.search.trim());
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ activities: SightseeingActivity[]; total: number }>(`/sightseeing${qs}`, {
      method: 'GET',
    });
  },

  // 2. Get single activity by ID
  async getActivityById(id: string): Promise<{ activity: SightseeingActivity }> {
    return request<{ activity: SightseeingActivity }>(`/sightseeing/${id}`, {
      method: 'GET',
    });
  },

  // 3. Create a new activity in the tenant library
  async createActivity(
    data: Omit<SightseeingActivity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ message: string; activity: SightseeingActivity }> {
    return request<{ message: string; activity: SightseeingActivity }>('/sightseeing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 4. Update an existing activity
  async updateActivity(
    id: string,
    updates: Partial<SightseeingActivity>
  ): Promise<{ message: string; activity: SightseeingActivity }> {
    return request<{ message: string; activity: SightseeingActivity }>(`/sightseeing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // 5. Delete activity
  async deleteActivity(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/sightseeing/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. Re-seed default sample activities
  async seedActivities(): Promise<{ message: string; activities: SightseeingActivity[] }> {
    return request<{ message: string; activities: SightseeingActivity[] }>('/sightseeing/seed', {
      method: 'POST',
    });
  },
};
