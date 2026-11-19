import React, { useState } from 'react'
import { Clock, X, Copy, Check, Mail } from 'lucide-react'
import { useTeam } from '../../../context/TeamContext'

export const PendingInvitesList: React.FC = () => {
  const { pendingInvites, revokeInvite } = useTeam()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (pendingInvites.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-slate-700">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-bold tracking-tight">Pending invitations</h3>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5">
        {pendingInvites.map((invite) => {
          const isCopied = copiedId === invite.id

          return (
            <div
              key={invite.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">
                    {invite.email}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                    {invite.role} · expires {invite.expiresAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {/* Status Badge */}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {invite.status}
                </span>

                {/* Copy Link Button */}
                <button
                  type="button"
                  onClick={() => handleCopy(invite.id, invite.inviteLink)}
                  title="Copy invite link"
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                      <span className="text-[#22c55e]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copy link</span>
                    </>
                  )}
                </button>

                {/* Revoke Invitation Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Revoke invitation for ${invite.email}?`)) {
                      revokeInvite(invite.id)
                    }
                  }}
                  title="Revoke invitation"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
