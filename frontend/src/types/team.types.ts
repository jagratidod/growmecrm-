export type TeamRole = 'Admin' | 'Agent' | 'Manager'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  status: 'Active' | 'Inactive'
  lastActive: string
  isCurrentUser?: boolean
  isOwner?: boolean
  avatarUrl?: string
}

export interface PendingInvite {
  id: string
  email: string
  role: TeamRole
  token: string
  inviteLink: string
  expiresAt: string
  invitedAt: string
  status: 'Invited'
}

export interface TeamStats {
  members: number
  admins: number
  pendingInvites: number
}
