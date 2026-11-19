import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLeads } from '../../../context/LeadsContext'
import type { LeadStage } from '../../../types/lead.types'

interface PipelineStageConfig {
  id: LeadStage
  label: string
  color: string
  hoverColor: string
}

export const PipelineChevronBar: React.FC = () => {
  const { leads, filters, updateFilter } = useLeads()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const stages: PipelineStageConfig[] = [
    { id: 'New', label: 'New', color: 'bg-[#453372]', hoverColor: 'hover:bg-[#382760]' },
    { id: 'Contacted', label: 'Contacted', color: 'bg-indigo-600', hoverColor: 'hover:bg-indigo-700' },
    { id: 'Qualified', label: 'Qualified', color: 'bg-[#ff7675]', hoverColor: 'hover:bg-rose-500' },
    { id: 'Proposal sent', label: 'Proposal sent', color: 'bg-[#ffb800]', hoverColor: 'hover:bg-amber-600' },
    { id: 'Negotiation', label: 'Negotiation', color: 'bg-orange-600', hoverColor: 'hover:bg-orange-700' },
    { id: 'Won', label: 'Won', color: 'bg-[#22c55e]', hoverColor: 'hover:bg-emerald-600' },
    { id: 'Lost', label: 'Lost', color: 'bg-slate-600', hoverColor: 'hover:bg-slate-700' },
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
              className={`relative px-4 sm:px-5 py-2 text-xs font-semibold text-white transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                stage.color
              } ${stage.hoverColor} ${
                isSelected ? 'ring-2 ring-[#453372] ring-offset-2 z-10 brightness-110 scale-[1.02]' : 'opacity-95'
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
        className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-xs flex items-center justify-center shrink-0 transition"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
