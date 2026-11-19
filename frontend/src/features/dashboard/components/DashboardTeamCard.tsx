import React from 'react'
import { UserPlus, ArrowRight } from 'lucide-react'

interface DashboardTeamCardProps {
  onManageTeam?: () => void
}

export const DashboardTeamCard: React.FC<DashboardTeamCardProps> = ({ onManageTeam }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#53388f] via-[#453372] to-[#3a2862] text-white p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
      <div>
        {/* User Plus Icon in frosted badge matching screenshot 2 */}
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white mb-4 shadow-2xs">
          <UserPlus className="w-5 h-5" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Build your team
        </h3>

        <p className="text-xs sm:text-sm text-purple-100/90 mt-1 mb-5 leading-relaxed">
          Invite agents so everyone can work leads together in one pipeline.
        </p>
      </div>

      <div>
        <button
          onClick={onManageTeam}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-purple-50 text-[#453372] text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Manage team</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  )
}
