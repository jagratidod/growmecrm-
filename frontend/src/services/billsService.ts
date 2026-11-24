import { request } from './api';
import type { Bill, BillStats } from '../types/bill.types';

export const billsService = {
  // 1. Get all vendor bills with optional filters and KPI stats
  async getBills(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<{ bills: Bill[]; stats: BillStats }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ bills: Bill[]; stats: BillStats }>(`/bills${qs}`, {
      method: 'GET',
    });
  },

  // 2. Get single bill by ID
  async getBillById(id: string): Promise<{ bill: Bill }> {
    return request<{ bill: Bill }>(`/bills/${id}`, {
      method: 'GET',
    });
  },

  // 3. Create a new vendor bill
  async createBill(
    data: Omit<Bill, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<{ message: string; bill: Bill }> {
    return request<{ message: string; bill: Bill }>('/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 4. Update an existing vendor bill
  async updateBill(
    id: string,
    updates: Partial<Bill>
  ): Promise<{ message: string; bill: Bill }> {
    return request<{ message: string; bill: Bill }>(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // 5. Record additional payment towards a bill
  async recordPayment(
    id: string,
    additionalPaid: number
  ): Promise<{ message: string; bill: Bill }> {
    return request<{ message: string; bill: Bill }>(`/bills/${id}/payments`, {
      method: 'POST',
      body: JSON.stringify({ additionalPaid }),
    });
  },

  // 6. Delete a bill
  async deleteBill(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/bills/${id}`, {
      method: 'DELETE',
    });
  },
};
