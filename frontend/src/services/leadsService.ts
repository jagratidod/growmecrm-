import { request } from './api';
import type { Lead, LeadFilters, LeadStage, LeadActivity } from '../types/lead.types';

export interface LeadsApiResponse {
  leads: Lead[];
  stats: {
    overall: number;
    today: number;
    converted: number;
  };
}

export const leadsService = {
  // 1. Get all leads with optional query parameters
  async getLeads(filters?: Partial<LeadFilters>): Promise<LeadsApiResponse> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.stage && filters.stage !== 'All') params.append('stage', filters.stage);
      if (filters.temperature && filters.temperature !== 'All') params.append('temperature', filters.temperature);
      if (filters.customerType && filters.customerType !== 'All') params.append('customerType', filters.customerType);
      if (filters.assignedTo && filters.assignedTo !== 'All') params.append('assignedTo', filters.assignedTo);
      if (filters.destination) params.append('destination', filters.destination);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<LeadsApiResponse>(`/leads${queryString}`, { method: 'GET' });
  },

  // 2. Get single lead by ID
  async getLeadById(id: string): Promise<Lead> {
    return request<Lead>(`/leads/${id}`, { method: 'GET' });
  },

  // 3. Create a new lead
  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>): Promise<Lead> {
    return request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  // 4. Update lead details
  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    return request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // 5. Change lead stage (Kanban drag-and-drop)
  async changeStage(id: string, newStage: LeadStage): Promise<Lead> {
    return request<Lead>(`/leads/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ newStage }),
    });
  },

  // 6. Add activity to lead
  async addActivity(leadId: string, activity: Omit<LeadActivity, 'id' | 'leadId' | 'timestamp'>): Promise<Lead> {
    return request<Lead>(`/leads/${leadId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  },

  // 7. Bulk import leads
  async importLeads(leads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>[]): Promise<{ count: number; message: string }> {
    return request<{ count: number; message: string }>('/leads/import', {
      method: 'POST',
      body: JSON.stringify({ leads }),
    });
  },

  // 8. Delete a lead
  async deleteLead(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/leads/${id}`, {
      method: 'DELETE',
    });
  },
};
