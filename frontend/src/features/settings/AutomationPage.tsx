import React, { useState, useEffect } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../components/ui/Toast'
import { Zap, Menu, Check, Clock } from 'lucide-react'

interface AutomationPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const AutomationPage: React.FC<AutomationPageProps> = ({ onNavigateMenu }) => {
  const { automation, updateAutomation } = useSettings()
  const { toast } = useToast()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Local form state
  const [enabled, setEnabled] = useState(automation.enabled)
  const [nudgeAfterHours, setNudgeAfterHours] = useState(automation.nudgeAfterHours || 48)
  const [nudgeMessage, setNudgeMessage] = useState(
    automation.nudgeMessage ||
      'Just checking in — happy to help if you still have questions about your trip! Let us know.'
  )
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setEnabled(automation.enabled)
    setNudgeAfterHours(automation.nudgeAfterHours || 48)
    setNudgeMessage(
      automation.nudgeMessage ||
        'Just checking in — happy to help if you still have questions about your trip! Let us know.'
    )
  }, [automation])

  const handleToggleEnabled = () => {
    const nextState = !enabled
    setEnabled(nextState)
    updateAutomation({ enabled: nextState })
    toast({
      type: nextState ? 'success' : 'info',
      title: nextState ? 'Automation Enabled' : 'Automation Paused',
      description: nextState
        ? 'Automatic follow-up checks are now active every 15 minutes.'
        : 'Automatic follow-up nudges have been paused.',
    })
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const hours = Math.min(720, Math.max(1, Number(nudgeAfterHours) || 48))

    updateAutomation({
      enabled,
      nudgeAfterHours: hours,
      nudgeMessage: nudgeMessage.trim(),
    })

    setIsSaved(true)
    toast({
      type: 'success',
      title: 'Settings Saved',
      description: 'Follow-up automation rules have been updated.',
    })
    setTimeout(() => setIsSaved(false), 2500)
  }

  const isOver24Hours = Number(nudgeAfterHours) > 24

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active Automation tab cutout under SETTINGS */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Automation"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#453372] text-white flex items-center justify-center font-bold text-xs">
              TT
            </div>
            <span className="font-bold text-sm text-slate-900">Automation</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-5xl w-full mx-auto space-y-6 pb-12">
          {/* Header Bar matching screenshot */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Follow-up Automation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Automatically nudge leads that have gone quiet — respects each channel's own rules.
            </p>
          </div>

          {/* Card 1: Automatic follow-up nudges matching screenshot */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Top Row: Title, Icon and Toggle Switch */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#453372] border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 fill-current stroke-[1.5]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      Automatic follow-up nudges
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                      Runs a check every 15 minutes for open leads with no reply and an unchanged
                      status.
                    </p>
                  </div>
                </div>

                {/* Toggle switch matching screenshot */}
                <button
                  type="button"
                  onClick={handleToggleEnabled}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                    enabled ? 'bg-[#453372]' : 'bg-slate-200'
                  }`}
                  role="switch"
                  aria-checked={enabled}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Field 1: Nudge after */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                  Nudge after
                </label>
                <div className="w-32">
                  <input
                    type="number"
                    min={1}
                    max={720}
                    value={nudgeAfterHours}
                    onChange={(e) => setNudgeAfterHours(Number(e.target.value) || 0)}
                    placeholder="48"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Hours of silence before a nudge is sent (1-720).
                </p>
              </div>

              {/* Warning Banner matching screenshot */}
              {isOver24Hours ? (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed space-y-1">
                  <p>
                    WhatsApp and Instagram only accept a message within{' '}
                    <span className="font-bold">24 hours</span> of the customer's last message. With{' '}
                    {nudgeAfterHours} hours, nudges can only reach leads that have an email
                    address — <span className="font-bold">set 23 hours or less</span> to nudge on
                    WhatsApp and Instagram.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-900 leading-relaxed flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p>
                    Eligible for <span className="font-bold">WhatsApp, Instagram, and Email</span>{' '}
                    nudges within Meta's 24-hour customer care window.
                  </p>
                </div>
              )}

              {/* Field 2: Nudge message */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                  Nudge message
                </label>
                <textarea
                  rows={3}
                  value={nudgeMessage}
                  onChange={(e) => setNudgeMessage(e.target.value)}
                  placeholder="Just checking in — happy to help if you still have questions about your trip! Let us know."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white resize-y"
                />
              </div>

              {/* Action Button matching screenshot */}
              <div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Nudge log matching screenshot */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Nudge log
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                Every scheduled check, whether it sent, was skipped, or failed — most recent first.
              </p>
            </div>

            {automation.logs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No automation checks recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {automation.logs.map((log) => (
                  <div
                    key={log.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          log.status === 'Sent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.status === 'Skipped'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-purple-50 text-[#453372] border border-purple-200'
                        }`}
                      >
                        {log.status}
                      </span>
                      {log.leadName && (
                        <span className="font-bold text-slate-900">{log.leadName}</span>
                      )}
                      {log.channel && (
                        <span className="text-slate-400">via {log.channel}</span>
                      )}
                      <span className="text-slate-600">{log.details}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
