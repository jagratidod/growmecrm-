import { request } from './api';

export interface ProfileDetailsResponse {
  fullName: string;
  email: string;
  role: string;
  organization: string;
  memberSince: string;
  lastSignIn: string;
  avatarUrl?: string;
}

export const profileService = {
  // 1. Get authenticated user profile
  async getProfile(): Promise<ProfileDetailsResponse> {
    return request<ProfileDetailsResponse>('/auth/profile', { method: 'GET' });
  },

  // 2. Update personal details (Full name and Email)
  async updateProfile(data: { fullName?: string; email?: string }): Promise<{ message: string; fullName: string; email: string }> {
    return request<{ message: string; fullName: string; email: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 3. Change password with current password verification
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const result = await request<{ message: string; token?: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    // The server revokes older tokens on a password change and returns a fresh one for this session.
    if (result.token) {
      const store = localStorage.getItem('crm_auth_token') ? localStorage : sessionStorage;
      store.setItem('crm_auth_token', result.token);
    }
    return { message: result.message };
  },
};
