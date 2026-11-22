import { request } from './api';

export interface DashboardMetrics {
  totalLeads: number;
  openLeads: number;
  wonLeads: number;
  lostLeads: number;
  newThisWeek: number;
  totalBookings: number;
  departingThisMonth: number;
  totalTripValue: number;
  totalCollected: number;
  conversionRate: number;
}

export interface DashboardPipelineStage {
  stage: string;
  label: string;
  color: string;
  bg: string;
  count: number;
  value: number;
  percentage: number;
}

export interface DashboardRecentLead {
  id: string;
  name: string;
  email?: string;
  phone: string;
  destination: string;
  travelers: number;
  budget: number;
  status: string;
  assignedTo?: string;
  createdAt: string;
}

export interface DashboardFollowUpSummaryItem {
  id: string;
  title: string;
  leadName: string;
  phone: string;
  destination: string;
  dueDate: string;
  dueTime: string;
  type: string;
  note: string;
  status: string;
}

export interface DashboardDepartureItem {
  id: string;
  customerName: string;
  destination: string;
  departure: string;
  daysUntil: number;
  travellers: number;
  status: string;
  totalAmount: number;
  amountPaid: number;
}

export interface DashboardSummaryResponse {
  metrics: DashboardMetrics;
  pipeline: DashboardPipelineStage[];
  recentLeads: DashboardRecentLead[];
  followUps: {
    dueTodayCount: number;
    overdueCount: number;
    totalPendingCount: number;
    items: DashboardFollowUpSummaryItem[];
  };
  upcomingDepartures: DashboardDepartureItem[];
  team: {
    activeMembers: number;
    pendingInvites: number;
  };
}

export const dashboardService = {
  // Fetch unified real-time dashboard analytics & summaries
  async getSummary(): Promise<DashboardSummaryResponse> {
    return request<DashboardSummaryResponse>('/dashboard/summary', {
      method: 'GET',
    });
  },
};
