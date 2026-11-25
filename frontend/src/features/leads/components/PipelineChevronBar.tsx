import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import type { LeadStage } from '../../../types/lead.types'

interface PipelineStageConfig {
  id: LeadStage
  label: string
  color: string
}

export const PipelineChevronBar: React.FC = () => {
  const { leads, filters, updateFilter } = useLeads()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const stages: PipelineStageConfig[] = [
    { id: 'New', label: 'New', color: 'bg-brand-soft text-brand-hover' },
    { id: 'Contacted', label: 'Contacted', color: 'bg-blue-soft text-blue-ink' },
    { id: 'Qualified', label: 'Qualified', color: 'bg-indigo-50 text-indigo-800' },
    { id: 'Proposal sent', label: 'Proposal sent', color: 'bg-amber-50 text-amber-800' },
    { id: 'Negotiation', label: 'Negotiation', color: 'bg-orange-50 text-orange-800' },
    { id: 'Won', label: 'Won', color: 'bg-emerald-50 text-emerald-800' },
    { id: 'Lost', label: 'Lost', color: 'bg-canvas text-copy-muted' },
  ]

  const stageCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    stages.forEach((s) => (counts[s.id] = 0))
    leads.forEach((l) => {
      if (counts[l.status] !== undefined) {
        counts[l.status]++
      }
    })
    return counts
  }, [leads])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -200 : 200
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const handleStageClick = (stageId: LeadStage) => {
    if (filters.stage === stageId) {
      updateFilter('stage', 'All')
    } else {
      updateFilter('stage', stageId)
    }
  }

  return (
    <div className="relative flex items-center gap-1.5 mb-4 group select-none">
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll lead stages left"
        className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-xs flex items-center justify-center shrink-0 transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Chevrons Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center overflow-x-auto scrollbar-none py-1 scroll-smooth gap-1"
      >
        {stages.map((stage, index) => {
          const isSelected = filters.stage === stage.id
          const count = stageCounts[stage.id] || 0
          const isFirst = index === 0
          const isLast = index === stages.length - 1

          // Precise polygon chevron clip-path
          const clipPath = isFirst
            ? 'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%)'
            : isLast
            ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 10px 50%)'
            : 'polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%, 10px 50%)'

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => handleStageClick(stage.id)}
              style={{ clipPath }}
              aria-pressed={isSelected}
              className={`relative px-4 sm:px-5 py-2 text-xs font-semibold transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                isSelected ? 'bg-brand text-white' : `${stage.color} hover:brightness-95`
              }`}
            >
              <span className="truncate">{stage.label}</span>
              {count > 0 && (
                <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded-full font-bold">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll lead stages right"
        className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-xs flex items-center justify-center shrink-0 transition"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
