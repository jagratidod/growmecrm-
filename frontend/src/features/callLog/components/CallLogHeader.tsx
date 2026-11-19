import React, { useState, useRef, useEffect } from 'react'
import { Plus, Search, ChevronDown, Check } from 'lucide-react'
import { useCallLog } from '../../../context/CallLogContext'

interface CallLogHeaderProps {
  onOpenLogModal: () => void
}

export const CallLogHeader: React.FC<CallLogHeaderProps> = ({ onOpenLogModal }) => {
  const { filters, setUserFilter, setSearchLead } = useCallLog()
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const usersList = ['All users', 'Kushal Pareta', 'Priya Sharma', 'Rahul Verma']

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-6">
      {/* Top Row: Title and + Log a call button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Call Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manually logged calls against a lead — who called, when, and the outcome.
          </p>
        </div>

        <button
          onClick={onOpenLogModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white font-semibold text-sm shadow-xs hover:shadow transition-all active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log a call</span>
        </button>
      </div>

      {/* Filter Row matching screenshot 1 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
        {/* User Dropdown */}
        <div className="w-full sm:w-56" ref={dropdownRef}>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">User</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-sm font-semibold text-slate-800 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors"
            >
              <span>{filters.user}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu matching screenshot 1 */}
            {isUserDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                {usersList.map((u) => {
                  const isSelected = filters.user === u
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => {
                        setUserFilter(u)
                        setIsUserDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-xs sm:text-sm text-left flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-purple-50/60 text-[#453372] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{u}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#453372]" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lead Search Input matching screenshot 1 */}
        <div className="w-full sm:w-80">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Lead</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads by name or phone..."
              value={filters.searchLead}
              onChange={(e) => setSearchLead(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] shadow-2xs transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
