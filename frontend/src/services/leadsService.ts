import { request, ROUTE_READ_TTL } from './api';
import type { Lead, LeadFilters, LeadStage, LeadActivity, LeadStats, CsvLeadRow } from '../types/lead.types';

export interface LeadsApiResponse {
  leads: Lead[];
  stats: LeadStats;
  pagination: { page: number; total: number; totalPages: number };
}

export const leadsService = {
  // 1. Get all leads with optional query parameters
  async getLeads(filters?: Partial<LeadFilters> & { page?: number; limit?: number; sort?: string; direction?: string }, signal?: AbortSignal): Promise<LeadsApiResponse> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.stage && filters.stage !== 'All') params.append('stage', filters.stage);
      if (filters.temperature && filters.temperature !== 'All') params.append('temperature', filters.temperature);
      if (filters.customerType && filters.customerType !== 'All') params.append('customerType', filters.customerType);
      if (filters.assignedTo && filters.assignedTo !== 'All') params.append('assignedTo', filters.assignedTo);
      if (filters.destination) params.append('destination', filters.destination);
      if (filters.source && filters.source !== 'All') params.append('source', filters.source);
      if (filters.view && filters.view !== 'all') params.append('view', filters.view);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.direction) params.set('direction', filters.direction);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<LeadsApiResponse>(`/leads${queryString}`, { method: 'GET', signal, cacheMs: filters?.search ? undefined : ROUTE_READ_TTL });
  },

  async getOptions(search: string, signal: AbortSignal) {
    const params = new URLSearchParams({ picker: '1', search });
    return request<{ leads: Pick<Lead, 'id' | 'name' | 'phone' | 'destination'>[] }>(`/leads?${params}`, { signal });
  },

  // 2. Get single lead by ID
  async getLeadById(id: string, signal?: AbortSignal): Promise<Lead> {
    return request<Lead>(`/leads/${id}`, { method: 'GET', signal });
  },

  // 3. Create a new lead
  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'activities'>, requestId?: string): Promise<Lead> {
    return request<Lead>('/leads', {
      method: 'POST',
      headers: requestId ? { 'Idempotency-Key': requestId } : undefined,
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
  async changeStage(id: string, newStage: LeadStage, lostReason?: string): Promise<Lead> {
    return request<Lead>(`/leads/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ newStage, lostReason }),
    });
  },

  // 6. Add activity to lead
  async addActivity(leadId: string, activity: Omit<LeadActivity, 'id' | 'leadId' | 'timestamp'>): Promise<Lead> {
    return request<Lead>(`/leads/${leadId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  },

  async importLeads(leads: CsvLeadRow[]) {
    return request<{ count: number; skipped: number; errors: { row: number; message: string }[] }>('/leads/import', {
      method: 'POST', body: JSON.stringify({ leads }),
    });
  },

  async archiveLead(id: string, archived: boolean) {
    return request<Lead>(`/leads/${id}/archive`, {
      method: 'PATCH', body: JSON.stringify({ archived }),
    });
  },
};
