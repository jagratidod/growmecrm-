import React from 'react'
import {
  Users,
  Target,
  Trophy,
  Sparkles,
  CalendarCheck,
  Plane,
  Wallet,
  Coins,
} from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import { useBookings } from '../../../context/BookingsContext'
import type { DashboardMetrics } from '../../../services/dashboardService'

interface DashboardStatCardsProps {
  metrics?: DashboardMetrics
}

export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({ metrics }) => {
  const { leads } = useLeads()
  const { bookings } = useBookings()

  // Use server metrics when available, or compute dynamically as fallback
  const totalLeads = metrics ? metrics.totalLeads : leads.length

  const openLeads = metrics
    ? metrics.openLeads
    : leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length

  const wonLeads = metrics
    ? metrics.wonLeads
    : leads.filter((l) => l.status === 'Won').length

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const newThisWeek = metrics
    ? metrics.newThisWeek
    : leads.filter((l) => {
        const created = new Date(l.createdAt)
        return created >= sevenDaysAgo
      }).length

  const totalBookings = metrics ? metrics.totalBookings : bookings.length

  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const departingThisMonth = metrics
    ? metrics.departingThisMonth
    : bookings.filter((b) => {
        if (!b.departure) return false
        const depDate = new Date(b.departure)
        return depDate.getMonth() === currentMonth && depDate.getFullYear() === currentYear
      }).length

  const totalTripValue = metrics
    ? metrics.totalTripValue
    : bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) ||
      leads.filter((l) => l.status === 'Won').reduce((sum, l) => sum + (l.budget || 0), 0)

  const totalCollected = metrics
    ? metrics.totalCollected
    : bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0)

  const stats = [
    {
      label: 'Total leads',
      value: totalLeads.toString(),
      icon: Users,
      badgeColor: 'bg-[#7c3aed] text-white',
    },
    {
      label: 'Open',
      value: openLeads.toString(),
      icon: Target,
      badgeColor: 'bg-[#0284c7] text-white',
    },
    {
      label: 'Won',
      value: wonLeads.toString(),
      icon: Trophy,
      badgeColor: 'bg-[#059669] text-white',
    },
    {
      label: 'New this week',
      value: newThisWeek.toString(),
      icon: Sparkles,
      badgeColor: 'bg-[#f59e0b] text-white',
    },
    {
      label: 'Bookings',
      value: totalBookings.toString(),
      icon: CalendarCheck,
      badgeColor: 'bg-[#db2777] text-white',
    },
    {
      label: 'Departing this month',
      value: departingThisMonth.toString(),
      icon: Plane,
      badgeColor: 'bg-[#0891b2] text-white',
    },
    {
      label: 'Trip value',
      value: totalTripValue === 0 ? '₹0' : `₹${totalTripValue.toLocaleString('en-IN')}`,
      icon: Wallet,
      badgeColor: 'bg-[#7c3aed] text-white',
    },
    {
      label: 'Collected',
      value: totalCollected === 0 ? '₹0' : `₹${totalCollected.toLocaleString('en-IN')}`,
      icon: Coins,
      badgeColor: 'bg-[#059669] text-white',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-600 truncate">
                {stat.label}
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${stat.badgeColor}`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="mt-3 sm:mt-4">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stat.value}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
