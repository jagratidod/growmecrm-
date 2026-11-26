import { lazy } from 'react'
import type { ComponentType } from 'react'

function preloadablePage(loadPage: () => Promise<{ default: ComponentType }>) {
  let loading: ReturnType<typeof loadPage> | undefined
  const load = () => loading ??= loadPage().catch((error: unknown) => {
    loading = undefined
    throw error
  })
  return Object.assign(lazy(load), { preload: load })
}

const LeadsPage = preloadablePage(() => import('../leads/LeadsPage').then((page) => ({ default: page.LeadsPage })))
const BookingsPage = preloadablePage(() => import('../bookings/BookingsPage').then((page) => ({ default: page.BookingsPage })))
const TeamPage = preloadablePage(() => import('../team/TeamPage').then((page) => ({ default: page.TeamPage })))
const BillsPage = preloadablePage(() => import('../bills/BillsPage').then((page) => ({ default: page.BillsPage })))
const ItinerariesPage = preloadablePage(() => import('../itineraries/ItinerariesPage').then((page) => ({ default: page.ItinerariesPage })))
const PackagesPage = preloadablePage(() => import('../packages/PackagesPage').then((page) => ({ default: page.PackagesPage })))
const HotelsPage = preloadablePage(() => import('../hotels/HotelsPage').then((page) => ({ default: page.HotelsPage })))
const SightseeingPage = preloadablePage(() => import('../sightseeing/SightseeingPage').then((page) => ({ default: page.SightseeingPage })))
const InboxPage = preloadablePage(() => import('../inbox/InboxPage').then((page) => ({ default: page.InboxPage })))
const EventsPage = preloadablePage(() => import('../calendar/EventsPage').then((page) => ({ default: page.EventsPage })))
const CalendarPage = preloadablePage(() => import('../calendar/CalendarPage').then((page) => ({ default: page.CalendarPage })))
const CallLogPage = preloadablePage(() => import('../callLog/CallLogPage').then((page) => ({ default: page.CallLogPage })))
const FollowUpsPage = preloadablePage(() => import('../followUps/FollowUpsPage').then((page) => ({ default: page.FollowUpsPage })))
const InvoicesPage = preloadablePage(() => import('../invoices/InvoicesPage').then((page) => ({ default: page.InvoicesPage })))
const CommunicationsPage = preloadablePage(() => import('../communications/CommunicationsPage').then((page) => ({ default: page.CommunicationsPage })))
const BotFlowsPage = preloadablePage(() => import('../botFlows/BotFlowsPage').then((page) => ({ default: page.BotFlowsPage })))
const ProfilePage = preloadablePage(() => import('../settings/ProfilePage').then((page) => ({ default: page.ProfilePage })))
const ChannelsPage = preloadablePage(() => import('../settings/ChannelsPage').then((page) => ({ default: page.ChannelsPage })))
const AiAgentPage = preloadablePage(() => import('../settings/AiAgentPage').then((page) => ({ default: page.AiAgentPage })))
const OrganizationPage = preloadablePage(() => import('../settings/OrganizationPage').then((page) => ({ default: page.OrganizationPage })))
const InvoiceDetailPage = preloadablePage(() => import('../settings/InvoiceDetailPage').then((page) => ({ default: page.InvoiceDetailPage })))
const AutomationPage = preloadablePage(() => import('../settings/AutomationPage').then((page) => ({ default: page.AutomationPage })))
const DashboardPage = preloadablePage(() => import('../dashboard/DashboardPage').then((page) => ({ default: page.DashboardPage })))
const WebsitesPage = preloadablePage(() => import('./WorkspacePages').then((page) => ({ default: page.WebsitesPage })))
export const clientPages: Record<string, ComponentType & { preload: () => Promise<unknown> }> = {
  '/dashboard': DashboardPage,
  '/websites': WebsitesPage,
  '/bookings': BookingsPage,
  '/bills': BillsPage,
  '/team': TeamPage,
  '/itineraries': ItinerariesPage,
  '/packages': PackagesPage,
  '/sightseeing': SightseeingPage,
  '/hotels': HotelsPage,
  '/inbox': InboxPage,
  '/calendar': CalendarPage,
  '/events': EventsPage,
  '/call-log': CallLogPage,
  '/follow-ups': FollowUpsPage,
  '/invoices': InvoicesPage,
  '/communications': CommunicationsPage,
  '/bot-flows': BotFlowsPage,
  '/profile': ProfilePage,
  '/channels': ChannelsPage,
  '/ai-agent': AiAgentPage,
  '/organization': OrganizationPage,
  '/invoice-detail': InvoiceDetailPage,
  '/automation': AutomationPage,
  '/leads': LeadsPage,
}

export function preloadWorkspaceRoute(path: string) {
  clientPages[path]?.preload().catch(() => { /* Navigation still uses the normal route loader. */ })
}
