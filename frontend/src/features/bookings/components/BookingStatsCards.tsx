import { useMemo } from 'react'
import { Calendar, PlaneTakeoff, Wallet, BadgeCheck } from 'lucide-react'
import { CrmMetrics } from '../../../components/crm/CrmMetrics'
import { formatBookingAmount } from '../formatBookingAmount'
import { useBookings } from '../../../context/BookingsContext'

export function BookingStatsCards() {
  const { bookings, stats, loading, loadError } = useBookings()
  const currencyTotals = useMemo(() => {
    const totals = new Map<string, { total: number; paid: number }>()
    for (const booking of bookings) {
      if (booking.status === 'Cancelled') continue
      const currency = booking.currency || 'INR'
      const prior = totals.get(currency) ?? { total: 0, paid: 0 }
      totals.set(currency, { total: prior.total + (booking.totalAmount || 0), paid: prior.paid + (booking.amountPaid || 0) })
    }
    return [...totals].sort(([first], [second]) => first.localeCompare(second))
  }, [bookings])
  const formatTotals = (kind: 'total' | 'paid') =>
    currencyTotals.length ? currencyTotals.map(([currency, totals]) => formatBookingAmount(totals[kind], currency)) : [formatBookingAmount(0)]

  return <CrmMetrics name="Booking metrics" loading={loading || Boolean(loadError)} metrics={[
    { label: 'Total bookings', values: [stats.totalBookings.toLocaleString('en-IN')], icon: Calendar },
    { label: 'Departing this month', values: [stats.departingThisMonth.toLocaleString('en-IN')], icon: PlaneTakeoff },
    { label: 'Booking value', values: formatTotals('total'), icon: Wallet },
    { label: 'Collected', values: formatTotals('paid'), icon: BadgeCheck },
  ]} />
}
