import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import type { TeamMember, PendingInvite, TeamStats, TeamRole } from '../types/team.types'

interface TeamContextType {
  members: TeamMember[]
  pendingInvites: PendingInvite[]
  stats: TeamStats
  isInviteModalOpen: boolean
  setIsInviteModalOpen: (open: boolean) => void
  createInvite: (email: string, role: TeamRole) => PendingInvite
  revokeInvite: (inviteId: string) => void
  deleteMember: (memberId: string) => void
  updateMemberRole: (memberId: string, newRole: TeamRole) => void
  loadDemoData: () => void
  clearAllTeam: () => void
}

const STORAGE_MEMBERS_KEY = 'treki_crm_team_members_data'
const STORAGE_INVITES_KEY = 'treki_crm_team_invites_data'

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Workspace Admin',
    email: 'admin@growmecrm.com',
    role: 'Admin',
    status: 'Active',
    lastActive: 'Just now',
    isCurrentUser: true,
  },
  {
    id: 'tm-2',
    name: 'Sales Executive',
    email: 'sales@growmecrm.com',
    role: 'Agent',
    status: 'Active',
    lastActive: '3 hours ago',
  },
]

const DEFAULT_INVITES: PendingInvite[] = [
  {
    id: 'inv-1',
    email: 'dodjagrati@gmail.com',
    role: 'Agent',
    token: 'VZxV0nAje82mK91pQ',
    inviteLink: 'https://joinetra.com/accept-invite?token=VZxV0nAje82mK91pQ',
    expiresAt: '26 Nov 2026',
    invitedAt: new Date().toISOString(),
    status: 'Invited',
  },
]

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MEMBERS_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DEFAULT_MEMBERS
  })

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_INVITES_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return DEFAULT_INVITES
  })

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(members))
    } catch {
      // ignore
    }
  }, [members])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_INVITES_KEY, JSON.stringify(pendingInvites))
    } catch {
      // ignore
    }
  }, [pendingInvites])

  // Dynamic stats calculation matching Screenshot 2
  const stats = useMemo<TeamStats>(() => {
    const adminCount = members.filter((m) => m.role === 'Admin').length
    return {
      members: members.length,
      admins: adminCount,
      pendingInvites: pendingInvites.length,
    }
  }, [members, pendingInvites])

  const createInvite = (email: string, role: TeamRole): PendingInvite => {
    // Generate secure randomized token
    const token = 'VZxV' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    const inviteLink = `https://joinetra.com/accept-invite?token=${token}`

    // Calculate expiry date (7 days from now)
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const formattedExpiry = expiry.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    const newInvite: PendingInvite = {
      id: 'inv-' + Date.now(),
      email: email.trim(),
      role,
      token,
      inviteLink,
      expiresAt: formattedExpiry,
      invitedAt: new Date().toISOString(),
      status: 'Invited',
    }

    setPendingInvites((prev) => [newInvite, ...prev])
    return newInvite
  }

  const revokeInvite = (inviteId: string) => {
    setPendingInvites((prev) => prev.filter((inv) => inv.id !== inviteId))
  }

  const deleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
  }

  const updateMemberRole = (memberId: string, newRole: TeamRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    )
  }

  const loadDemoData = () => {
    setMembers(DEFAULT_MEMBERS)
    setPendingInvites(DEFAULT_INVITES)
  }

  const clearAllTeam = () => {
    setMembers(DEFAULT_MEMBERS.slice(0, 1)) // keep current user
    setPendingInvites([])
  }

  return (
    <TeamContext.Provider
      value={{
        members,
        pendingInvites,
        stats,
        isInviteModalOpen,
        setIsInviteModalOpen,
        createInvite,
        revokeInvite,
        deleteMember,
        updateMemberRole,
        loadDemoData,
        clearAllTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export const useTeam = (): TeamContextType => {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}
