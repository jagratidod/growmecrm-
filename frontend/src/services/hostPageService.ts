import { request } from './api';
import type { HostPageData, HostReview, HostContact } from '../types/hostPage.types';

export interface HostPageResponse {
  hostPage: HostPageData & {
    websiteSlug?: string;
    isPublished?: boolean;
    viewCount?: number;
  };
}

export interface PublicHostPageResponse {
  agency: {
    name: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    slug: string;
  };
  hostPage: HostPageData & {
    websiteSlug?: string;
    isPublished?: boolean;
    viewCount?: number;
  };
  packages: Array<{
    id: string;
    name: string;
    destination: string;
    price: number;
    originalPrice?: number;
    currency: string;
    duration?: { days: number; nights: number };
    highlights?: string[];
    bannerImage?: string;
  }>;
}

export const hostPageService = {
  // 1. Fetch current agency host page data
  async getHostPage(): Promise<HostPageResponse> {
    return request<HostPageResponse>('/host-page', {
      method: 'GET',
    });
  },

  // 2. Update host page content (banner, about us, contact, slug)
  async updateHostPage(data: {
    bannerImage?: string;
    aboutUs?: string;
    contact?: Partial<HostContact>;
    websiteSlug?: string;
    isPublished?: boolean;
  }): Promise<HostPageResponse> {
    return request<HostPageResponse>('/host-page', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 3. Add a new customer review
  async addReview(review: Omit<HostReview, 'id' | 'createdAt'>): Promise<{
    message: string;
    review: HostReview;
    hostPage: HostPageData;
  }> {
    return request<{ message: string; review: HostReview; hostPage: HostPageData }>('/host-page/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  // 4. Delete an existing review
  async deleteReview(reviewId: string): Promise<{
    message: string;
    hostPage: HostPageData;
  }> {
    return request<{ message: string; hostPage: HostPageData }>(`/host-page/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },

  // 5. Public visitor endpoint (unauthenticated)
  async getPublicHostPage(slug: string): Promise<PublicHostPageResponse> {
    return request<PublicHostPageResponse>(`/host-page/public/${slug}`, {
      method: 'GET',
    });
  },
};
