import React, { useEffect, useState } from 'react'
import { LeadsSidebar } from './components/LeadsSidebar'
import { LeadsHeader } from './components/LeadsHeader'
import { LeadStatsCards } from './components/LeadStatsCards'
import { LeadsSearchFilter } from './components/LeadsSearchFilter'
import { PipelineChevronBar } from './components/PipelineChevronBar'
import { TemperatureChips } from './components/TemperatureChips'
import { LeadsEmptyState } from './components/LeadsEmptyState'
import { LeadsTable } from './components/LeadsTable'
import { LostLeadModal } from './components/LostLeadModal'
import { NewLeadModal } from './components/NewLeadModal'
import { LeadDetailsDrawer } from './components/LeadDetailsDrawer'
import { ImportCsvModal } from './components/ImportCsvModal'
import { useLeads } from '../../context/LeadsContext'
import { SearchX } from 'lucide-react'
import { useRouter } from '../../context/RouterContext'
import { useToast } from '../../components/ui/Toast'
import { leadsService } from '../../services/leadsService'
import { leadStages, type LeadStage, type LeadView, type LeadSource } from '../../types/lead.types'

interface LeadsPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ onNavigateMenu }) => {
  const { stats, pagination, loading, loadError, refresh, filters, resetFilters, updateFilter, setIsNewLeadModalOpen, setSelectedLead } = useLeads()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const { search, navigate } = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const query = new URLSearchParams(search)
    const stage = query.get('stage') as LeadStage | null
    const source = query.get('source') as LeadSource | null
    if (source && ['Manual', 'Website', 'CSV', 'Facebook', 'Instagram', 'Google', 'WhatsApp', 'Referral'].includes(source)) {
      resetFilters()
      updateFilter('source', source)
    }
    if (stage && leadStages.includes(stage)) {
      resetFilters()
      updateFilter('stage', stage)
    }
    if (query.get('new') === '1') {
      setIsNewLeadModalOpen(true)
      navigate('/leads', { replace: true })
    }
    const id = query.get('lead')
    if (!id) return
    const controller = new AbortController()
    leadsService.getLeadById(id, controller.signal).then(
      (lead) => { if (!controller.signal.aborted) setSelectedLead(lead) },
      (error: Error) => { if (!controller.signal.aborted) toast({ type: 'error', title: 'Could not open lead', description: error.message }) },
    ).finally(() => { if (!controller.signal.aborted) navigate('/leads', { replace: true }) })
    return () => controller.abort()
  }, [search, navigate, resetFilters, updateFilter, setIsNewLeadModalOpen, setSelectedLead, toast])

  const isCompletelyEmpty = stats.overall === 0 && filters.view === 'all'
  const isFilterEmpty = pagination.total === 0
  const views: { value: LeadView; label: string }[] = [
    { value: 'all', label: 'All leads' }, { value: 'mine', label: 'My leads' }, { value: 'unassigned', label: 'Unassigned' },
    { value: 'due', label: 'Follow-up due' }, { value: 'no-next-action', label: 'No next action' }, { value: 'archived', label: 'Archived' },
  ]

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
      {/* Left Navigation Sidebar with Signature Curved Cutout in Theme */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 gm-crm-content">
          {/* Header Bar */}
          <LeadsHeader onOpenMobileMenu={() => setIsMobileSidebarOpen(true)} />

          {/* 4-Color Accent KPI Stat Cards (Coral, Purple, Yellow, Green) */}
          <LeadStatsCards />

          {/* CRM Pipeline & Leads Table Card */}
          <div className="gm-crm-results">
            {/* Search Bar + Filters */}
            <div className="gm-stage-filters" role="group" aria-label="Lead views">
              {views.map(({ value, label }) => <button type="button" key={value} aria-pressed={filters.view === value}
                onClick={() => { resetFilters(); updateFilter('view', value) }}>{label}</button>)}
            </div>
            <LeadsSearchFilter />

            {/* Sales Pipeline Chevron Bar */}
            <PipelineChevronBar />

            {/* Temperature Filter Chips */}
            <TemperatureChips />

            {/* Content: Empty State, Filtered Empty, or Table */}
            {loadError ? <p role="alert" className="gm-error">{loadError} <button type="button" className="gm-text-button" onClick={refresh}>Retry</button></p> : loading && isFilterEmpty ? <p role="status">Loading leads…</p> : isCompletelyEmpty ? (
              <LeadsEmptyState />
            ) : isFilterEmpty ? (
              <div className="gm-crm-empty">
                <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">{filters.view === 'archived' ? 'No archived leads match' : 'No leads match your criteria'}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try another search or clear the filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-brand text-white hover:bg-brand-hover transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <LeadsTable />
            )}
          </div>
        </main>
      </div>

      {/* Slide-out Drawers & Modals */}
      <NewLeadModal />
      <LostLeadModal />
      <LeadDetailsDrawer />
      <ImportCsvModal />
    </div>
  )
}
