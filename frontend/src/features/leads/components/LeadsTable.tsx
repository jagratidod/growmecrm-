import React, { useState, useMemo } from 'react'
import {
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Globe,
  Search,
  Share2,
  User,
} from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import type { Lead, LeadStage, LeadTemperature, LeadSource } from '../../../types/lead.types'

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-2.5 h-2.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-2.5 h-2.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const SourceBadge: React.FC<{ source: LeadSource | string }> = ({ source }) => {
  const s = (source || 'Manual').toLowerCase()
  if (s.includes('whats') || s.includes('wa')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <MessageCircle className="w-2.5 h-2.5 text-emerald-600" /> WhatsApp
      </span>
    )
  }
  if (s.includes('insta')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
        <InstagramIcon className="w-2.5 h-2.5 text-pink-600" /> Instagram
      </span>
    )
  }
  if (s.includes('face') || s.includes('fb')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        <FacebookIcon className="w-2.5 h-2.5 text-blue-600" /> Facebook
      </span>
    )
  }
  if (s.includes('web')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
        <Globe className="w-2.5 h-2.5 text-purple-600" /> Website
      </span>
    )
  }
  if (s.includes('goog')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <Search className="w-2.5 h-2.5 text-amber-600" /> Google
      </span>
    )
  }
  if (s.includes('ref')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
        <Share2 className="w-2.5 h-2.5 text-indigo-600" /> Referral
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
      <User className="w-2.5 h-2.5 text-slate-500" /> Manual
    </span>
  )
}

export const LeadsTable: React.FC = () => {
  const { filteredLeads, setSelectedLead, deleteLead, changeLeadStage } = useLeads()

  const [sortField, setSortField] = useState<keyof Lead>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      const aVal = a[sortField] ?? ''
      const bVal = b[sortField] ?? ''

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const strA = String(aVal).toLowerCase()
      const strB = String(bVal).toLowerCase()
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredLeads, sortField, sortDirection])

  const totalPages = Math.ceil(sortedLeads.length / pageSize) || 1
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedLeads.slice(start, start + pageSize)
  }, [sortedLeads, currentPage, pageSize])

  const stageBadgeColors: Record<LeadStage, string> = {
    New: 'bg-purple-50 text-brand border-purple-200',
    Contacted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Qualified: 'bg-rose-50 text-rose-700 border-rose-200',
    'Proposal sent': 'bg-amber-50 text-amber-700 border-amber-200',
    Negotiation: 'bg-orange-50 text-orange-700 border-orange-200',
    Won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Lost: 'bg-slate-100 text-slate-700 border-slate-300',
  }

  const tempBadgeColors: Record<LeadTemperature, string> = {
    Hot: 'bg-rose-500 text-white',
    Warm: 'bg-amber-500 text-white',
    Cold: 'bg-sky-500 text-white',
    Won: 'bg-emerald-600 text-white',
    Lost: 'bg-slate-600 text-white',
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-canvas text-brand font-bold uppercase tracking-wider text-[11px]">
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Customer Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Contact</th>
              <th
                onClick={() => handleSort('destination')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Destination</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Travel Details</th>
              <th
                onClick={() => handleSort('budget')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Budget</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Temp</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Assigned To</th>
              <th
                onClick={() => handleSort('createdAt')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Created</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedLeads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
              >
                {/* Customer name */}
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[150px]">{lead.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        lead.customerType === 'B2B'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {lead.customerType}
                    </span>
                  </div>
                  {lead.interestedPackage && (
                    <p className="text-[10px] text-slate-400 font-normal truncate max-w-[150px]">
                      {lead.interestedPackage}
                    </p>
                  )}
                </td>

                {/* Source */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <SourceBadge source={lead.source} />
                </td>

                {/* Contact */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{lead.phone}</span>
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[130px]">{lead.email}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Destination */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate max-w-[130px]">{lead.destination}</span>
                  </div>
                </td>

                {/* Travel Details */}
                <td className="py-3.5 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{lead.travelDate || 'Flexible'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{lead.travelers} Traveler{lead.travelers > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </td>

                {/* Budget */}
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {lead.currency} {lead.budget.toLocaleString()}
                </td>

                {/* Temperature */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      tempBadgeColors[lead.temperature] || 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {lead.temperature}
                  </span>
                </td>

                {/* Stage */}
                <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={lead.status}
                    onChange={(e) => changeLeadStage(lead.id, e.target.value as LeadStage)}
                    className={`text-[11px] font-semibold border rounded-lg px-2 py-1 focus:outline-none cursor-pointer ${
                      stageBadgeColors[lead.status]
                    }`}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal sent">Proposal sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </td>

                {/* Assigned to */}
                <td className="py-3.5 px-4 text-slate-700 font-medium">
                  {lead.assignedTo}
                </td>

                {/* Created Date */}
                <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                  {new Date(lead.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedLead(lead)}
                      title="View Lead Details"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteLead(lead.id)}
                      title="Delete Lead"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, sortedLeads.length)} of {sortedLeads.length} leads
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
