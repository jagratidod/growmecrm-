import { request, ROUTE_READ_TTL } from './api';
import type { Booking, BookingFilters, BookingStats, BookingStatus } from '../types/booking.types';

export interface BookingsApiResponse {
  bookings: Booking[];
  stats: BookingStats;
}

export const bookingsService = {
  // 1. Get all bookings with optional query filters
  async getBookings(filters?: Partial<BookingFilters>): Promise<BookingsApiResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<BookingsApiResponse>(`/bookings${qs}`, { method: 'GET', cacheMs: ROUTE_READ_TTL });
  },

  // 2. Get single booking by ID
  async getBookingById(id: string): Promise<Booking> {
    return request<Booking>(`/bookings/${id}`, { method: 'GET' });
  },

  // 3. Create a new booking
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    return request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // 4. Update booking details
  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    return request<Booking>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // 5. Record payment installment
  async recordPayment(id: string, amount: number): Promise<{ message: string; booking: Booking; balanceDue: number; leadSyncWarning?: string }> {
    return request<{ message: string; booking: Booking; balanceDue: number; leadSyncWarning?: string }>(`/bookings/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    });
  },

  // 6. Update booking status
  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    return request<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async retryLeadSync(id: string): Promise<Booking> {
    return request<Booking>(`/bookings/${id}/sync-lead`, { method: 'POST' });
  },

  // 7. Delete booking
  async deleteBooking(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};
