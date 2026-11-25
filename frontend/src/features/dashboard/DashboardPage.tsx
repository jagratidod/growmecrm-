import React, { useState, useEffect, useCallback } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { DashboardHero } from './components/DashboardHero'
import { DashboardStatCards } from './components/DashboardStatCards'
import { DashboardPipelineOverview } from './components/DashboardPipelineOverview'
import { DashboardRecentLeads } from './components/DashboardRecentLeads'
import { DashboardTeamCard } from './components/DashboardTeamCard'
import { DashboardFollowUpsCard } from './components/DashboardFollowUpsCard'
import { DashboardUpcomingDeparturesCard } from './components/DashboardUpcomingDeparturesCard'
import { NewLeadModal } from '../leads/components/NewLeadModal'
import { Menu } from 'lucide-react'
import { dashboardService, type DashboardSummaryResponse } from '../../services/dashboardService'

interface DashboardPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateMenu }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await dashboardService.getSummary()
      setSummary(data)
    } catch (err) {
      console.warn('Dashboard summary fetch failed, using local context fallback:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleOpenLeads = () => {
    if (onNavigateMenu) {
      onNavigateMenu('Leads')
    }
  }

  const handleOpenTeam = () => {
    if (onNavigateMenu) {
      onNavigateMenu('Team')
    }
  }

  const handleOpenBookings = () => {
    if (onNavigateMenu) {
      onNavigateMenu('Bookings')
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
      {/* Sidebar with active Dashboard tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Dashboard"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top App Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">
              TT
            </div>
            <span className="font-bold text-sm text-slate-900">Dashboard</span>
          </div>
          <div className="w-9" />
        </div>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Welcome Banner matching screenshot 1 */}
          <DashboardHero onRefresh={fetchDashboardData} isLoading={isLoading} />

          {/* 8 Stat Cards Grid matching screenshot 1 */}
          <DashboardStatCards metrics={summary?.metrics} />

          {/* Pipeline Overview Section matching screenshot 1 & 2 */}
          <DashboardPipelineOverview onOpenPipeline={handleOpenLeads} />

          {/* Bottom 2-Column Section matching screenshot 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Recent Leads (2 cols) */}
            <div className="lg:col-span-2">
              <DashboardRecentLeads onViewAll={handleOpenLeads} />
            </div>

            {/* Right Column: Build Team + Follow-ups + Departures (1 col) */}
            <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
              <DashboardTeamCard onManageTeam={handleOpenTeam} />
              <DashboardFollowUpsCard
                onViewAll={handleOpenLeads}
                followUpsData={summary?.followUps}
              />
              <DashboardUpcomingDeparturesCard
                onOpenCalendar={handleOpenBookings}
                departures={summary?.upcomingDepartures}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Global New Lead Modal */}
      <NewLeadModal />
    </div>
  )
}
