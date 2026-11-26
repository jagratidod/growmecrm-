import { useAuth } from '../../context/AuthContext'
import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { TeamHeader } from './components/TeamHeader'
import { TeamStatsCards } from './components/TeamStatsCards'
import { TeamMembersTable } from './components/TeamMembersTable'
import { PendingInvitesList } from './components/PendingInvitesList'
import { InviteTeammateModal } from './components/InviteTeammateModal'

interface TeamPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const TeamPage: React.FC<TeamPageProps> = ({ onNavigateMenu }) => {
  const { user } = useAuth()
  const canManage = user?.role === 'owner' || user?.role === 'admin'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
      {/* Sidebar with active Team tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Team"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header Bar */}
          <TeamHeader onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

          {/* 3 KPI Metric Cards (Members, Admins, Pending invites) */}
          <TeamStatsCards />

          {/* Active Members Table */}
          <TeamMembersTable />

          {/* Pending Invitations Section */}
          {canManage && <PendingInvitesList />}
        </main>
      </div>

      {/* 2-Step Invite Teammate Modal */}
      {canManage && <InviteTeammateModal />}
    </div>
  )
}
