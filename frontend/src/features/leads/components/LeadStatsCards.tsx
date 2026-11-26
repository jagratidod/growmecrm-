import { CalendarDays, CheckCircle2, TrendingUp, Users } from 'lucide-react'
import { CrmMetrics } from '../../../components/crm/CrmMetrics'
import { useLeads } from '../../../context/LeadsContext'

export function LeadStatsCards() {
  const { stats, loading, loadError } = useLeads()
  return <CrmMetrics name="Lead metrics" loading={loading || Boolean(loadError)} metrics={[
    { label: 'Total leads', values: [stats.overall.toLocaleString('en-IN')], icon: Users },
    { label: 'New today', values: [stats.today.toLocaleString('en-IN')], icon: CalendarDays },
    { label: 'Open leads', values: [stats.open.toLocaleString('en-IN')], icon: TrendingUp },
    { label: 'Won leads', values: [stats.converted.toLocaleString('en-IN')], icon: CheckCircle2 },
  ]} />
}
