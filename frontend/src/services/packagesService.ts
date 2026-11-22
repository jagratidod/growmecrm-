import { request } from './api';
import type { TravelPackage } from '../types/package.types';

export const packagesService = {
  // 1. Get all packages with optional search and status filter
  async getPackages(params?: { search?: string; status?: 'ALL' | 'DRAFT' | 'PUBLISHED' }): Promise<TravelPackage[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<TravelPackage[]>(`/packages${qs}`, { method: 'GET' });
  },

  // 2. Get single package by ID
  async getPackageById(id: string): Promise<TravelPackage> {
    return request<TravelPackage>(`/packages/${id}`, { method: 'GET' });
  },

  // 3. Create a new package
  async createPackage(pkgData: Partial<TravelPackage>): Promise<TravelPackage> {
    return request<TravelPackage>('/packages', {
      method: 'POST',
      body: JSON.stringify(pkgData),
    });
  },

  // 4. Update an existing package
  async updatePackage(id: string, pkgData: Partial<TravelPackage>): Promise<TravelPackage> {
    return request<TravelPackage>(`/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pkgData),
    });
  },

  // 5. Change package status (DRAFT / PUBLISHED / ARCHIVED)
  async changeStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): Promise<TravelPackage> {
    return request<TravelPackage>(`/packages/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // 6. Delete package
  async deletePackage(id: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/packages/${id}`, {
      method: 'DELETE',
    });
  },

  // 7. Public brochure view (no auth needed)
  async getPublicPackage(agencySlug: string, packageSlug: string): Promise<{ package: TravelPackage; agency: any }> {
    return request<{ package: TravelPackage; agency: any }>(`/packages/public/${agencySlug}/${packageSlug}`, {
      method: 'GET',
    });
  },
};
