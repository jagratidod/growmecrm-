import { request } from './api';
import type { Hotel } from '../types/hotel.types';

export const hotelsService = {
  // 1. Get all partner hotels for the current agency
  async getHotels(params?: {
    search?: string;
    city?: string;
    stars?: number | 'All';
  }): Promise<Hotel[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.city && params.city !== 'All') query.append('city', params.city);
    if (params?.stars !== undefined && params.stars !== 'All') query.append('stars', String(params.stars));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await request<{ hotels: Hotel[]; total: number }>(`/hotels${qs}`, {
      method: 'GET',
    });
    return res.hotels || [];
  },

  // 2. Get single hotel by ID
  async getHotelById(id: string): Promise<Hotel> {
    const res = await request<{ hotel: Hotel }>(`/hotels/${id}`, {
      method: 'GET',
    });
    return res.hotel;
  },

  // 3. Create a new partner hotel
  async createHotel(data: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hotel> {
    const res = await request<{ message: string; hotel: Hotel }>('/hotels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.hotel;
  },

  // 4. Update an existing hotel
  async updateHotel(id: string, updates: Partial<Hotel>): Promise<Hotel> {
    const res = await request<{ message: string; hotel: Hotel }>(`/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.hotel;
  },

  // 5. Delete hotel from directory
  async deleteHotel(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/hotels/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. Get distinct cities in directory
  async getCities(): Promise<string[]> {
    const res = await request<{ cities: string[] }>('/hotels/cities', {
      method: 'GET',
    });
    return res.cities || [];
  },
};
