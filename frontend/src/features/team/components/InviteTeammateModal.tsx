import React, { useState } from 'react'
import { Mail, X, Copy, Check } from 'lucide-react'
import { useTeam } from '../../../context/TeamContext'
import type { TeamRole, PendingInvite } from '../../../types/team.types'

export const InviteTeammateModal: React.FC = () => {
  const { isInviteModalOpen, setIsInviteModalOpen, createInvite } = useTeam()

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamRole>('Agent')
  const [step, setStep] = useState<1 | 2>(1)
  const [createdInvite, setCreatedInvite] = useState<PendingInvite | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  if (!isInviteModalOpen) return null

  const handleClose = () => {
    setIsInviteModalOpen(false)
    setStep(1)
    setEmail('')
    setRole('Agent')
    setError('')
    setCreatedInvite(null)
    setCopied(false)
  }

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    const invite = createInvite(email.trim(), role)
    setCreatedInvite(invite)
    setStep(2)
  }

  const handleCopyLink = () => {
    if (createdInvite?.inviteLink) {
      navigator.clipboard.writeText(createdInvite.inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleInviteAnother = () => {
    setStep(1)
    setEmail('')
    setRole('Agent')
    setError('')
    setCreatedInvite(null)
    setCopied(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#453372] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Invite a teammate
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                {step === 1
                  ? "They'll join your organization with the role you choose."
                  : "They'll join with the role you choose."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: FORM (Screenshot 3) */}
        {step === 1 && (
          <form onSubmit={handleSubmitStep1} className="p-6 pt-3 space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email <span className="text-[#ff7675]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="teammate@agency.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
              />
              {error && (
                <p className="text-[11px] text-[#ff7675] mt-1 font-medium">{error}</p>
              )}
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TeamRole)}
                className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition cursor-pointer"
              >
                <option value="Agent">Agent — works leads</option>
                <option value="Admin">Admin — full access</option>
                <option value="Manager">Manager — oversees operations</option>
              </select>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#453372]/30 transition active:scale-[0.99]"
              >
                Create invite
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: LINK GENERATED (Screenshot 1) */}
        {step === 2 && createdInvite && (
          <div className="p-6 pt-3 space-y-4">
            {/* Callout Notice Box */}
            <div className="p-4 rounded-2xl bg-[#f3f4f8]/80 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
              Email delivery arrives in a later phase. For now, share this secure link with{' '}
              <strong className="text-slate-900 font-bold">{createdInvite.email}</strong> so they
              can set up their account.
            </div>

            {/* Invite link input + Copy button */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Invite link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdInvite.inviteLink}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 select-all font-mono focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-center shrink-0 ${
                    copied
                      ? 'border-[#22c55e] bg-emerald-50 text-[#22c55e]'
                      : 'border-[#453372] text-[#453372] hover:bg-purple-50'
                  }`}
                  title="Copy link"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleInviteAnother}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition"
              >
                Invite another
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#453372]/30 transition active:scale-[0.99]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
