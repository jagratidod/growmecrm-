import { request } from './api';
import type { CalendarEvent } from '../types/calendar.types';

export const calendarService = {
  // 1. Fetch all calendar events (manual + merged bookings)
  async getEvents(): Promise<{
    events: CalendarEvent[];
    manualCount: number;
    bookingCount: number;
  }> {
    return request<{
      events: CalendarEvent[];
      manualCount: number;
      bookingCount: number;
    }>('/calendar/events', {
      method: 'GET',
    });
  },

  // 2. Create a manual event
  async createEvent(data: {
    title: string;
    date: string;
    notes?: string;
    type?: string;
    color?: string;
    linkedBookingId?: string;
  }): Promise<{ message: string; event: CalendarEvent }> {
    return request<{ message: string; event: CalendarEvent }>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 3. Delete a manual event
  async deleteEvent(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/calendar/events/${id}`, {
      method: 'DELETE',
    });
  },
};
