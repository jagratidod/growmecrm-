import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const SmartDashboardWidgets: React.FC = () => {
  const selectedMonth = 'October, 2026'

  // Top Performers / Top Scorers from reference
  const topScorers = [
    {
      rank: '1st',
      name: 'Brandon Harris',
      school: 'St Xavier School',
      score: '99.90%',
      gradient: 'from-[#22c55e] to-[#16a34a]',
      badgeBg: 'bg-[#15803d]/40',
      avatar: 'BH',
    },
    {
      rank: '2nd',
      name: 'Charles James',
      school: 'Podar School',
      score: '99.76%',
      gradient: 'from-[#543b8c] to-[#3c2a63]',
      badgeBg: 'bg-[#2a1c49]/40',
      avatar: 'CJ',
    },
    {
      rank: '3rd',
      name: 'Mike Peter',
      school: 'Green Valley',
      score: '99.50%',
      gradient: 'from-[#ffb800] to-[#f59e0b]',
      badgeBg: 'bg-[#b45309]/40',
      avatar: 'MP',
    },
  ]

  // Days of calendar
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      {/* LEFT COLUMN: Calendar & Attendance (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Calendar & Attendance
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#ff7675]/15 text-[#ff7675] flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span className="text-xs font-semibold text-slate-600">02 {selectedMonth}</span>
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  type="button"
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday pills */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {weekDays.map((d) => (
              <span
                key={d}
                className="text-[11px] font-bold text-slate-500 py-1"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid matching reference */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs font-semibold">
            {/* Row 1 */}
            <span className="py-1.5 text-slate-300">29</span>
            <span className="py-1.5 text-slate-300">30</span>
            <span className="py-1.5 text-slate-700">01</span>
            <span className="py-1.5 flex items-center justify-center">
              <span className="w-7 h-7 rounded-full bg-[#22c55e] text-white flex items-center justify-center font-bold shadow-xs">
                02
              </span>
            </span>
            <span className="py-1.5 text-slate-700">03</span>
            <span className="py-1.5 text-slate-700">04</span>
            <span className="py-1.5 text-slate-700">05</span>

            {/* Row 2 */}
            <span className="py-1.5 text-slate-700">06</span>
            <span className="py-1.5 text-slate-700">07</span>
            <span className="py-1.5 text-slate-700">08</span>
            <span className="py-1.5 text-slate-700">09</span>
            <span className="py-1.5 text-slate-700">10</span>
            <span className="py-1.5 text-slate-700">11</span>
            <span className="py-1.5 text-slate-700">12</span>

            {/* Row 3 */}
            <span className="py-1.5 text-slate-700">13</span>
            <span className="py-1.5 text-slate-700">14</span>
            <span className="py-1.5 text-slate-700">15</span>
            <span className="py-1.5 text-slate-700">16</span>
            <span className="py-1.5 flex items-center justify-center">
              <span className="w-7 h-7 rounded-full bg-[#ffb800] text-white flex items-center justify-center font-bold shadow-xs">
                17
              </span>
            </span>
            <span className="py-1.5 text-slate-700">18</span>
            <span className="py-1.5 text-slate-700">19</span>

            {/* Row 4 */}
            <span className="py-1.5 text-slate-700">20</span>
            <span className="py-1.5 text-slate-700">21</span>
            <span className="py-1.5 text-slate-700">22</span>
            <span className="py-1.5 text-slate-700">23</span>
            <span className="py-1.5 text-slate-700">24</span>
            <span className="py-1.5 text-slate-700">25</span>
            <span className="py-1.5 text-slate-700">26</span>

            {/* Row 5 with connected green range for 27, 28, 29 */}
            <span className="py-1.5 flex items-center justify-center">
              <span className="w-full h-7 rounded-l-full bg-[#22c55e] text-white flex items-center justify-center font-bold">
                27
              </span>
            </span>
            <span className="py-1.5 flex items-center justify-center">
              <span className="w-full h-7 bg-[#22c55e] text-white flex items-center justify-center font-bold">
                28
              </span>
            </span>
            <span className="py-1.5 flex items-center justify-center">
              <span className="w-full h-7 rounded-r-full bg-[#22c55e] text-white flex items-center justify-center font-bold">
                29
              </span>
            </span>
            <span className="py-1.5 text-slate-700">30</span>
            <span className="py-1.5 text-slate-700">31</span>
            <span className="py-1.5 text-slate-300">01</span>
            <span className="py-1.5 text-slate-300">02</span>
          </div>
        </div>

        {/* Bottom Activity Notification in the Calendar card */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 tracking-tight">
              Activities Notification
            </h4>
            <button
              type="button"
              className="text-[11px] font-semibold text-[#22c55e] border border-[#22c55e] hover:bg-[#22c55e]/10 px-2.5 py-0.5 rounded-full transition"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <p className="font-bold text-slate-800">St Xavier School</p>
              <p className="text-[10px] text-slate-400">02 Oct, 2026</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Annual conference scheduled. Invitations sent to parents and teachers.
              </p>
            </div>
            <div>
              <p className="font-bold text-slate-800">Podar International School</p>
              <p className="text-[10px] text-slate-400">01 Oct, 2026</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Quarterly academic review and curriculum feedback session completed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Performance & Top Scorer (7 cols) */}
      <div className="lg:col-span-7 space-y-5">
        {/* School Performance 3D Bar Chart Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              School Performance
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              All final data in percentage (%)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Chart Legend on Left */}
            <div className="space-y-3 shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#453372]" />
                <span className="font-semibold text-slate-700">Govt. School</span>
                <span className="text-[10px] text-slate-400">Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffb800]" />
                <span className="font-semibold text-slate-700">Private School</span>
                <span className="text-[10px] text-slate-400">Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span className="font-semibold text-slate-700">Average School</span>
                <span className="text-[10px] text-slate-400">Performance</span>
              </div>
            </div>

            {/* Stylized 3D Bar Chart Visual */}
            <div className="flex items-end justify-center gap-6 sm:gap-8 h-36 w-full max-w-xs px-4">
              {/* Purple Bar */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-400">85%</span>
                <div className="w-9 sm:w-11 h-28 rounded-t-lg bg-gradient-to-r from-[#453372] to-[#543b8c] shadow-md shadow-[#453372]/20 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-2 bg-white/25 rounded-t-lg" />
                </div>
              </div>

              {/* Yellow Bar */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-400">65%</span>
                <div className="w-9 sm:w-11 h-20 rounded-t-lg bg-gradient-to-r from-[#ffb800] to-[#f59e0b] shadow-md shadow-[#ffb800]/25 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-2 bg-white/30 rounded-t-lg" />
                </div>
              </div>

              {/* Green Bar */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-400">75%</span>
                <div className="w-9 sm:w-11 h-24 rounded-t-lg bg-gradient-to-r from-[#22c55e] to-[#16a34a] shadow-md shadow-[#22c55e]/25 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-2 bg-white/30 rounded-t-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Scorer / Top Performers Podium 3 Colored Cards */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Top Scorer
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              2026-2027
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {topScorers.map((scorer) => (
              <div
                key={scorer.rank}
                className={`rounded-2xl p-4 text-white bg-gradient-to-b ${scorer.gradient} shadow-md flex flex-col items-center text-center justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform`}
              >
                {/* Avatar with subtle ring */}
                <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center font-bold text-sm tracking-wide mb-2 shadow-xs">
                  {scorer.avatar}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white tracking-tight truncate w-full">
                    {scorer.name}
                  </h4>
                  <p className="text-[10px] text-white/80 font-medium truncate w-full">
                    {scorer.school}
                  </p>
                </div>

                <div className="text-base font-black tracking-tight mt-2 text-white">
                  {scorer.score}
                </div>

                {/* Bottom Rank Pill */}
                <div
                  className={`w-full py-1 mt-2.5 rounded-lg text-xs font-bold ${scorer.badgeBg} text-white tracking-wide uppercase`}
                >
                  {scorer.rank}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
