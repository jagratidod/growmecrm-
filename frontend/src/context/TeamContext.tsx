import { useRouter } from './RouterContext'
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useToast } from '../components/ui/Toast'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
import { teamService } from '../services/teamService'
import type { TeamApiResponse } from '../services/teamService'
import type { PendingInvite, TeamRole } from '../types/team.types'

interface TeamContextType extends TeamApiResponse {
  isInviteModalOpen: boolean
  setIsInviteModalOpen: (open: boolean) => void
  createInvite: (email: string, role: TeamRole) => Promise<PendingInvite | undefined>
  revokeInvite: (id: string) => void
  deleteMember: (id: string) => void
  updateMemberRole: (id: string, role: TeamRole) => void
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)
const empty: TeamApiResponse = { members: [], pendingInvites: [], stats: { members: 0, admins: 0, pendingInvites: 0 } }

export function TeamProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState(empty)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const { toast } = useToast()
  const { access } = useWorkspace()
  const { path } = useRouter()
  const enabled = (access?.modules.includes('team')) && (['/team', '/leads', '/bookings', '/itineraries', '/call-log', '/follow-ups'].includes(path))

  useEffect(() => {
    if (!enabled) return
    let active = true
    teamService.getTeam().then(
      (value) => { if (active) setTeam(value) },
      (error: Error) => { if (active) toast({ type: 'error', title: 'Could not load team', description: error.message }) },
    )
    return () => { active = false }
  }, [enabled, toast])

  async function update<T>(operation: () => Promise<T>): Promise<T | undefined> {
    try {
      const value = await operation()
      setTeam(await teamService.getTeam())
      return value
    } catch (error) {
      toast({ type: 'error', title: 'Team update failed', description: (error as Error).message })
    }
  }
  return <TeamContext.Provider value={{ ...team, isInviteModalOpen, setIsInviteModalOpen,
    createInvite: (email, role) => update(() => teamService.createInvite(email, role)),
    revokeInvite: (id) => { void update(() => teamService.revokeInvite(id)) },
    deleteMember: (id) => { void update(() => teamService.deleteMember(id)) },
    updateMemberRole: (id, role) => { void update(() => teamService.updateMemberRole(id, role)) },
  }}>{children}</TeamContext.Provider>
}

export function useTeam() {
  const team = useContext(TeamContext)
  if (!team) throw new Error('useTeam must be used within a TeamProvider')
  return team
}
