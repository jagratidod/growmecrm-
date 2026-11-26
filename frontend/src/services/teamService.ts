import { request, ROUTE_READ_TTL } from './api';
import type { TeamMember, PendingInvite, TeamStats, TeamRole } from '../types/team.types';

export interface TeamApiResponse {
  members: TeamMember[];
  pendingInvites: PendingInvite[];
  stats: TeamStats;
}

export const teamService = {
  // 1. Get all members, pending invites, and stats
  async getTeam(): Promise<TeamApiResponse> {
    return request<TeamApiResponse>('/team', { method: 'GET', cacheMs: ROUTE_READ_TTL });
  },

  // 2. Invite a teammate (Admin/Owner)
  async createInvite(email: string, role: TeamRole): Promise<PendingInvite> {
    return request<PendingInvite>('/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  // 3. Revoke invite
  async revokeInvite(inviteId: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/team/invite/${inviteId}`, {
      method: 'DELETE',
    });
  },

  // 4. Update member role (Promote to Admin or Manager)
  async updateMemberRole(memberId: string, role: TeamRole): Promise<{ message: string; id: string; role: TeamRole }> {
    return request<{ message: string; id: string; role: TeamRole }>(`/team/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  // 5. Delete member
  async deleteMember(memberId: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/team/${memberId}`, {
      method: 'DELETE',
    });
  },
};
