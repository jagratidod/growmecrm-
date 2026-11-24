import { request } from './api';
import type { Itinerary, ItineraryDay } from '../types/itinerary.types';

export const itinerariesService = {
  // 1. Fetch all itineraries with status and search filters
  async getItineraries(params?: {
    status?: string;
    search?: string;
  }): Promise<{ itineraries: Itinerary[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ itineraries: Itinerary[]; count: number }>(`/itineraries${qs}`, {
      method: 'GET',
    });
  },

  // 2. Fetch single itinerary by ID
  async getItineraryById(id: string): Promise<{ itinerary: Itinerary }> {
    return request<{ itinerary: Itinerary }>(`/itineraries/${id}`, {
      method: 'GET',
    });
  },

  // 3. Create a new custom itinerary
  async createItinerary(
    data: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt' | 'days'> & { days?: ItineraryDay[] }
  ): Promise<{ message: string; itinerary: Itinerary }> {
    return request<{ message: string; itinerary: Itinerary }>('/itineraries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 4. Update an existing itinerary
  async updateItinerary(
    id: string,
    updates: Partial<Itinerary>
  ): Promise<{ message: string; itinerary: Itinerary }> {
    return request<{ message: string; itinerary: Itinerary }>(`/itineraries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // 5. Delete an itinerary
  async deleteItinerary(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/itineraries/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. Add a day to an itinerary
  async addDay(
    itineraryId: string,
    day: Omit<ItineraryDay, 'id' | 'dayNumber'>
  ): Promise<{ message: string; day: ItineraryDay; itinerary: Itinerary }> {
    return request<{ message: string; day: ItineraryDay; itinerary: Itinerary }>(
      `/itineraries/${itineraryId}/days`,
      {
        method: 'POST',
        body: JSON.stringify(day),
      }
    );
  },

  // 7. Update specific day in an itinerary
  async updateDay(
    itineraryId: string,
    dayId: string,
    updates: Partial<ItineraryDay>
  ): Promise<{ message: string; itinerary: Itinerary }> {
    return request<{ message: string; itinerary: Itinerary }>(
      `/itineraries/${itineraryId}/days/${dayId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  },

  // 8. Delete specific day from an itinerary
  async deleteDay(
    itineraryId: string,
    dayId: string
  ): Promise<{ message: string; itinerary: Itinerary }> {
    return request<{ message: string; itinerary: Itinerary }>(
      `/itineraries/${itineraryId}/days/${dayId}`,
      {
        method: 'DELETE',
      }
    );
  },
};
