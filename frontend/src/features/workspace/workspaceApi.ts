import { request } from '../../services/api'

export const moduleNames: Record<string, string> = {
  leads: 'Leads', bookings: 'Bookings', finance: 'Invoices & bills', catalog: 'Travel catalog',
  communications: 'Communications', calendar: 'Calendar', team: 'Team', websites: 'Websites',
  pages: 'Pages', blog: 'Blog', media: 'Media uploads', seo: 'SEO',
}

export const routeModules: Record<string, string> = {
  '/leads': 'leads', '/follow-ups': 'leads', '/bookings': 'bookings', '/bills': 'finance',
  '/invoices': 'finance', '/invoice-detail': 'finance', '/team': 'team', '/calendar': 'calendar',
  '/events': 'calendar', '/call-log': 'communications', '/inbox': 'communications',
  '/communications': 'communications', '/bot-flows': 'communications', '/channels': 'communications',
  '/ai-agent': 'communications', '/automation': 'communications', '/packages': 'catalog',
  '/hotels': 'catalog', '/itineraries': 'catalog', '/sightseeing': 'catalog',
  '/websites': 'websites', '/host-page': 'websites', '/linktree': 'websites',
}

export interface Access {
  plan: string
  modules: string[]
  billing: { checkoutUrl?: string; paidThrough?: string }
}
export interface Site {
  _id: string
  name: string
  domain: string
  sections: string[]
}
export interface Entry { slug: string; title: string; body: string; image: string }
export interface Section { title: string; body: string; image: string; entries?: Entry[] }
export interface SiteEditor { site: Site; draft: Record<string, Section>; publishedAt?: string }
export interface Client { id: string; name: string; plan: string; status: string; owner?: { email: string } }
export interface ClientDetail {
  organization: { name: string; plan: string; status: string }
  sites: Site[]
  modules: string[]
  addOns: string[]
  billing: Access['billing'] & { paymentReference?: string }
  connections: { mongo: boolean; cloudinary: boolean }
}

export const save = <T,>(path: string, data: unknown, method = 'PUT') =>
  request<T>(path, { method, body: JSON.stringify(data) })

export const getWorkspace = () => request<Access>('/workspace/access')
export const getClients = (search: string, page: number) => {
  const query = new URLSearchParams({ search, page: String(page), limit: '20' })
  return request<{ tenants: Client[]; pagination: { totalPages: number; total: number } }>(`/super-admin/tenants?${query}`)
}
export const getClient = (id: string) => request<ClientDetail>(`/platform/clients/${id}`)
export const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
