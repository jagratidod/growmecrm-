import React from 'react'
import { ShieldCheck, UserCheck, Briefcase, Trash2 } from 'lucide-react'
import { useTeam } from '../../../context/TeamContext'
import type { TeamRole } from '../../../types/team.types'

export const TeamMembersTable: React.FC = () => {
  const { members, deleteMember, updateMemberRole } = useTeam()

  const roleBadgeConfig: Record<TeamRole, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
    Admin: {
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-[#453372]',
      icon: ShieldCheck,
    },
    Agent: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: UserCheck,
    },
    Manager: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      icon: Briefcase,
    },
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-[#f3f4f8] text-[#453372] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-5">Member</th>
              <th className="py-3 px-5">Role</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Last Active</th>
              <th className="py-3 px-5 text-right">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => {
              const roleCfg = roleBadgeConfig[member.role] || roleBadgeConfig.Agent
              const RoleIcon = roleCfg.icon

              return (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Member Column */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#453372]/10 text-[#453372] font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role Column */}
                  <td className="py-4 px-5">
                    {member.isCurrentUser ? (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleCfg.bg} ${roleCfg.text}`}
                      >
                        <RoleIcon className="w-3.5 h-3.5" />
                        <span>{member.role}</span>
                      </span>
                    ) : (
                      <select
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.id, e.target.value as TeamRole)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-hidden ${roleCfg.bg} ${roleCfg.text}`}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Agent">Agent</option>
                        <option value="Manager">Manager</option>
                      </select>
                    )}
                  </td>

                  {/* Status Column */}
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                      <span>{member.status}</span>
                    </span>
                  </td>

                  {/* Last Active Column */}
                  <td className="py-4 px-5 text-slate-500 font-medium">
                    {member.lastActive}
                  </td>

                  {/* You Indicator / Action Column */}
                  <td className="py-4 px-5 text-right">
                    {member.isCurrentUser ? (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                        You
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove ${member.name} from team?`)) {
                            deleteMember(member.id)
                          }
                        }}
                        title="Remove member"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
