import { getCachedRead, request, ROUTE_READ_TTL, ROUTE_READ_STALE_WINDOW } from './api'
import type { LeadSource, LeadStage } from '../types/lead.types'

export interface DashboardSummary {
  metrics: {
    totalLeads: number
    openLeads: number
    wonLeads: number
    newThisWeek: number
    totalBookings: number
    departingThisMonth: number
    paymentsByCurrency: { currency: string; tripValue: number; collected: number }[]
  }
  pipeline: { stage: LeadStage; count: number; averageDays: number | null }[]
  sources: { source: LeadSource; total: number; won: number }[]
  recentLeads: { id: string; name: string; destination?: string; status: LeadStage; createdAt: string }[]
  followUps: {
    dueTodayCount: number
    overdueCount: number
    items: { id: string; title?: string; leadName: string; dueDate: string; dueTime?: string; status: 'overdue' | 'pending' }[]
  }
  upcomingDepartures: { id: string; customerName: string; destination: string; departure: string; status: string }[]
  team: { activeMembers: number; pendingInvites: number }
}

export const dashboardService = {
  getCachedSummary: () => getCachedRead<DashboardSummary>('/dashboard/summary', ROUTE_READ_STALE_WINDOW),
  getSummary: (signal?: AbortSignal, fresh = false) => request<DashboardSummary>('/dashboard/summary', { signal, fresh, cacheMs: ROUTE_READ_TTL }),
}
