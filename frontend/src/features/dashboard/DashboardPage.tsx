import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, CircleDollarSign, ListChecks, Menu, Plus, RefreshCw, Users, Wallet } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from '../../context/RouterContext'
import { dashboardService, type DashboardSummary } from '../../services/dashboardService'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useWorkspace } from '../workspace/WorkspaceAccess'
import { formatBookingAmount } from '../bookings/formatBookingAmount'
import './dashboard.css'

const dateLabel = (value: string) => new Date(value.slice(0, 10) + 'T12:00:00')
  .toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export function DashboardPage() {
  const { user } = useAuth()
  const { access, error: accessError } = useWorkspace()
  const { navigate } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [requestNumber, setRequestNumber] = useState(0)
  const [result, setResult] = useState<{ requestNumber: number; summary?: DashboardSummary; error?: string } | undefined>(() => {
    const summary = dashboardService.getCachedSummary()
    return summary ? { requestNumber: 0, summary } : undefined
  })
  const can = (module: string) => access?.modules.includes(module) ?? false
  const hasSummary = can('leads') || can('bookings') || can('team')
  const enabledModules = access?.modules.join(',')

  useEffect(() => {
    if (!hasSummary) return
    const controller = new AbortController()
    dashboardService.getSummary(controller.signal, requestNumber > 0).then(
      (summary) => { if (!controller.signal.aborted) setResult({ requestNumber, summary }) },
      (error: Error) => { if (!controller.signal.aborted) setResult({ requestNumber, error: error.message }) },
    )
    return () => controller.abort()
  }, [hasSummary, requestNumber, enabledModules])

  const current = result?.requestNumber === requestNumber ? result : undefined
  const data = result?.summary
  const refresh = () => setRequestNumber((number) => number + 1)
  const metrics = data?.metrics
  const leadLink = (stage: string) => '/leads?' + new URLSearchParams({ stage })
  const date = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata',
  }).format(new Date())
  const paymentTotals = (field: 'collected' | 'tripValue') => {
    const totals = metrics?.paymentsByCurrency.map((payment) => formatBookingAmount(payment[field], payment.currency))
    return totals?.length ? totals.join(' · ') : formatBookingAmount(0)
  }
  const cards = [
    ...(can('leads') ? [
      { label: 'Open leads', value: metrics?.openLeads, detail: metrics ? `${metrics.newThisWeek} new in the last 7 days` : '', icon: Users, link: '/leads' },
      { label: 'Won leads', value: metrics?.wonLeads, detail: metrics ? `${metrics.totalLeads} total leads` : '', icon: ListChecks, link: leadLink('Won') },
    ] : []),
    ...(can('bookings') ? [
      { label: 'Bookings', value: metrics?.totalBookings, detail: metrics ? `${metrics.departingThisMonth} departing this month` : '', icon: CalendarDays, link: '/bookings' },
      { label: 'Payments collected', value: metrics ? paymentTotals('collected') : undefined, detail: metrics ? `${paymentTotals('tripValue')} total booking value` : '', icon: Wallet, link: '/bookings' },
    ] : []),
  ]

  return <div className="gm-shell">
    <LeadsSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    <main className="gm-main gm-dashboard">
      <header className="gm-dashboard-heading">
        <div>
          <div className="gm-dashboard-date">
            <button type="button" className="gm-mobile gm-icon-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={19} /></button>
            <time>{date}</time>
          </div>
          <h1>{user?.organizationName || 'Workspace overview'}</h1>
        </div>
        <div className="gm-dashboard-actions">
          {hasSummary && <button type="button" className="gm-button secondary" onClick={refresh} disabled={!current} aria-label="Refresh dashboard"><RefreshCw size={16} /></button>}
          {can('leads') && <button type="button" className="gm-button" onClick={() => navigate('/leads?new=1')}><Plus size={17} /> New lead</button>}
          {can('bookings') && <button type="button" className={`gm-button ${can('leads') ? 'secondary' : ''}`} onClick={() => navigate('/bookings?new=1')}><Plus size={17} /> New booking</button>}
        </div>
      </header>

      {(accessError || current?.error) && <div className="gm-error" role="alert">{accessError || current?.error}{current?.error && <button className="gm-text-button" onClick={refresh}>Try again</button>}</div>}
      {cards.length > 0 && <section className="gm-dashboard-metrics" aria-label="Workspace metrics" aria-busy={!current}>
        {cards.map(({ label, value, detail, link, icon: Icon }) => <button type="button" className="gm-dashboard-metric" onClick={() => navigate(link)} key={label}>
          <span className="gm-dashboard-metric-label"><Icon size={17} aria-hidden="true" />{label}<ArrowRight size={14} aria-hidden="true" /></span>
          <strong>{value ?? '—'}</strong>
          {detail && <span>{detail}</span>}
        </button>)}
      </section>}
      {hasSummary && !current && <p role="status" className="gm-dashboard-status">Loading dashboard…</p>}

      {data && (can('leads') || can('bookings')) && <div className={`gm-dashboard-grid ${can('leads') ? '' : 'single'}`}>
        {can('leads') && <div className="gm-dashboard-column">
          <section className="gm-dashboard-panel">
            <header><h2>Sales pipeline</h2><button className="gm-text-button" onClick={() => navigate('/leads')}>Open leads <ArrowRight size={15} /></button></header>
            {data.metrics.totalLeads > 0 ? <div className="gm-pipeline-list">
              {data.pipeline.map(({ stage, count, averageDays }) => <button type="button" key={stage} onClick={() => navigate(leadLink(stage))}>
                <span>{stage}{averageDays != null && <small className="block text-copy-muted">Avg. {averageDays < 1 ? '<1' : Math.round(averageDays)} days</small>}</span>
                <span className="gm-pipeline-track" aria-hidden="true"><span style={{ width: `${data.metrics.totalLeads ? count / data.metrics.totalLeads * 100 : 0}%` }} /></span>
                <strong aria-label={`${count} leads`}>{count}</strong>
              </button>)}
            </div> : <p className="gm-dashboard-message">No leads in the pipeline yet.</p>}
          </section>
          <section className="gm-dashboard-panel">
            <header><h2>Recent leads</h2><button className="gm-text-button" onClick={() => navigate('/leads')}>View all <ArrowRight size={15} /></button></header>
            {data.recentLeads.length ? <ul className="gm-dashboard-list">{data.recentLeads.map((lead) => <li key={lead.id}>
              <button type="button" onClick={() => navigate('/leads?' + new URLSearchParams({ lead: lead.id }))}>
                <span><strong>{lead.name}</strong>{lead.destination && <small>{lead.destination}</small>}</span>
                <span className="gm-dashboard-list-end"><small>{dateLabel(lead.createdAt)}</small><span className="gm-dashboard-tag">{lead.status}</span></span>
              </button>
            </li>)}</ul> : <p className="gm-dashboard-message">No leads yet.</p>}
          </section>
        </div>}

        <div className="gm-dashboard-column">
          {can('leads') && <section className="gm-dashboard-panel gm-dashboard-focus">
            <header><div><h2>Follow-ups due</h2><p>{data.followUps.dueTodayCount} today · {data.followUps.overdueCount} overdue</p></div><button className="gm-text-button" onClick={() => navigate('/follow-ups?status=due')}>Open <ArrowRight size={15} /></button></header>
            {data.followUps.items.length ? <ul className="gm-dashboard-list">
              {data.followUps.items.map((item) => <li key={item.id}><div>
                <span><strong>{item.title || item.leadName}</strong><small>{[dateLabel(item.dueDate), item.dueTime].filter(Boolean).join(' · ')}</small></span>
                {item.status === 'overdue' && <span className="gm-dashboard-tag overdue">Overdue</span>}
              </div></li>)}
            </ul> : <p className="gm-dashboard-message">Nothing due today.</p>}
          </section>}
          {can('leads') && Boolean(data.sources?.length) && <section className="gm-dashboard-panel">
            <header><div><h2>Conversion by source</h2><p>Won leads / total leads</p></div></header>
            <ul className="gm-dashboard-list">
              {data.sources.map(({ source, total, won }) => <li key={source}><button type="button" onClick={() => navigate('/leads?' + new URLSearchParams({ source }))}>
                <strong>{source}</strong><span>{won} / {total} · {Math.round(won / total * 100)}%</span>
              </button></li>)}
            </ul>
          </section>}
          {can('bookings') && <section className="gm-dashboard-panel">
            <header><div><h2>Upcoming departures</h2><p>Next 30 days</p></div><button className="gm-text-button" onClick={() => navigate(can('calendar') ? '/calendar' : '/bookings')}>{can('calendar') ? 'Calendar' : 'Bookings'} <ArrowRight size={15} /></button></header>
            {data.upcomingDepartures.length ? <ul className="gm-dashboard-list">{data.upcomingDepartures.map((trip) => <li key={trip.id}><div>
              <span><strong>{trip.destination}</strong><small>{trip.customerName}</small></span><span className="gm-dashboard-tag">{dateLabel(trip.departure)}</span>
            </div></li>)}</ul> : <p className="gm-dashboard-message">No confirmed departures in the next 30 days.</p>}
          </section>}
        </div>
      </div>}
      {(data && can('team') || access?.billing.checkoutUrl && ['owner', 'admin'].includes(user?.role || '')) && <div className="gm-dashboard-utility">
        {data && can('team') && <button type="button" className="gm-dashboard-shortcut" onClick={() => navigate('/team')}><Users size={19} /><span><strong>Team</strong><small>{data.team.activeMembers} active · {data.team.pendingInvites} invited</small></span><ArrowRight size={16} /></button>}
        {access?.billing.checkoutUrl && ['owner', 'admin'].includes(user?.role || '') && <a className="gm-dashboard-shortcut" href={access.billing.checkoutUrl} target="_blank" rel="noreferrer"><CircleDollarSign size={19} /><span><strong>Subscription</strong><small>{access.billing.paidThrough ? `Paid through ${dateLabel(access.billing.paidThrough)}` : 'Open GrowMe checkout'}</small></span><ArrowRight size={16} /></a>}
      </div>}
      {!hasSummary && !accessError && <div className="gm-dashboard-panel"><p className="gm-dashboard-message">{can('websites') ? 'Manage your connected websites from this workspace.' : 'No CRM modules are currently enabled.'}</p>{can('websites') && <button className="gm-text-button gm-dashboard-message" onClick={() => navigate('/websites')}>Open websites <ArrowRight size={15} /></button>}</div>}
    </main>
  </div>
}
