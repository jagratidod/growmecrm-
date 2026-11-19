import React from 'react'
import { Compass, Edit3, Trash2, MapPin } from 'lucide-react'
import { useSightseeing } from '../../../context/SightseeingContext'
import { useToast } from '../../../components/ui/Toast'
import type { SightseeingActivity } from '../../../types/sightseeing.types'

interface SightseeingGridProps {
  onEditActivity: (activity: SightseeingActivity) => void
}

export const SightseeingGrid: React.FC<SightseeingGridProps> = ({ onEditActivity }) => {
  const { filteredActivities, deleteActivity } = useSightseeing()
  const { toast } = useToast()

  const handleDelete = (e: React.MouseEvent, act: SightseeingActivity) => {
    e.stopPropagation()
    if (window.confirm(`Delete activity "${act.name}" from library?`)) {
      deleteActivity(act.id)
      toast({ title: 'Activity removed from library', type: 'info' })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredActivities.map((act) => (
        <div
          key={act.id}
          onClick={() => onEditActivity(act)}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#453372]/30 transition-all cursor-pointer overflow-hidden flex flex-col group"
        >
          {/* Cover Photo */}
          <div className="relative h-44 bg-slate-100 overflow-hidden">
            {act.coverImage ? (
              <img
                src={act.coverImage}
                alt={act.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-50 text-[#453372]">
                <Compass className="w-12 h-12 stroke-[1.5]" />
              </div>
            )}

            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span>Sightseeing</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-[#453372] transition-colors line-clamp-1">
                {act.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                {act.description || 'No description added yet.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] font-medium text-purple-900/70 bg-purple-50 px-2 py-0.5 rounded-md">
                Reusable in day plans
              </span>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEditActivity(act)}
                  className="p-1.5 text-slate-400 hover:text-[#453372] hover:bg-purple-50 rounded-lg transition-colors"
                  title="Edit activity"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, act)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete activity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
