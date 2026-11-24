import { request } from './api';

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  destination: string;
  linkedBookingId?: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  currency?: string;
  status: 'paid' | 'partial' | 'unpaid';
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  taxDetails?: {
    gstin?: string;
    gstRate?: number;
    gstAmount?: number;
    hsnSacCode?: string;
  };
  notes?: string;
}

export interface InvoiceStats {
  totalBilled: number;
  totalCollected: number;
  totalPending: number;
}

export const invoicesService = {
  // 1. Get all invoices with search, status filter, and aggregate stats
  async getInvoices(params?: {
    status?: string;
    search?: string;
  }): Promise<{ invoices: InvoiceItem[]; stats: InvoiceStats }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ invoices: InvoiceItem[]; stats: InvoiceStats }>(`/invoices${qs}`, {
      method: 'GET',
    });
  },

  // 2. Get single invoice by ID
  async getInvoiceById(id: string): Promise<{
    invoice: InvoiceItem;
    organization?: { name: string; logoUrl: string; slug: string };
  }> {
    return request<{
      invoice: InvoiceItem;
      organization?: { name: string; logoUrl: string; slug: string };
    }>(`/invoices/${id}`, {
      method: 'GET',
    });
  },

  // 3. Create a new tax invoice
  async createInvoice(
    data: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      destination?: string;
      linkedBookingId?: string;
      issueDate?: string;
      dueDate?: string;
      totalAmount: number;
      paidAmount?: number;
      currency?: string;
      items?: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        amount: number;
      }>;
      taxDetails?: any;
      notes?: string;
    }
  ): Promise<{ message: string; invoice: InvoiceItem }> {
    return request<{ message: string; invoice: InvoiceItem }>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 4. Update an invoice
  async updateInvoice(
    id: string,
    updates: Partial<InvoiceItem>
  ): Promise<{ message: string; invoice: InvoiceItem }> {
    return request<{ message: string; invoice: InvoiceItem }>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // 5. Record payment on an invoice (partial or mark full)
  async recordPayment(
    id: string,
    payload: { amount?: number; markFull?: boolean }
  ): Promise<{ message: string; invoice: InvoiceItem }> {
    return request<{ message: string; invoice: InvoiceItem }>(`/invoices/${id}/payments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 6. Delete invoice
  async deleteInvoice(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/invoices/${id}`, {
      method: 'DELETE',
    });
  },
};
