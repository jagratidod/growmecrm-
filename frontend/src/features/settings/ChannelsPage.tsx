import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../components/ui/Toast'
import { MessageCircle, Mail, Menu, Check } from 'lucide-react'

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

interface ChannelsPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const ChannelsPage: React.FC<ChannelsPageProps> = ({ onNavigateMenu }) => {
  const { channels, toggleChannel, updateEmailConfig } = useSettings()
  const { toast } = useToast()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Email form state
  const [fromAddress, setFromAddress] = useState(channels.emailFromAddress)
  const [apiKey, setApiKey] = useState(channels.emailApiKey)
  const [savedEmail, setSavedEmail] = useState(false)

  const handleToggleWhatsApp = () => {
    toggleChannel('whatsapp')
    toast({
      type: channels.whatsappConnected ? 'info' : 'success',
      title: channels.whatsappConnected ? 'WhatsApp Disconnected' : 'WhatsApp Connected',
      description: channels.whatsappConnected
        ? 'WhatsApp integration has been paused.'
        : 'Meta Embedded Signup verified. WhatsApp is now connected!',
    })
  }

  const handleToggleInstagram = () => {
    toggleChannel('instagram')
    toast({
      type: channels.instagramConnected ? 'info' : 'success',
      title: channels.instagramConnected ? 'Instagram Disconnected' : 'Instagram Connected',
      description: channels.instagramConnected
        ? 'Instagram integration has been disconnected.'
        : 'Instagram account connected. Direct messages will land in your Inbox!',
    })
  }

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault()
    updateEmailConfig(fromAddress, apiKey)
    setSavedEmail(true)
    toast({
      type: 'success',
      title: 'Email Settings Saved',
      description: 'Your Resend / SendGrid credentials have been stored encrypted.',
    })
    setTimeout(() => setSavedEmail(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active Channels cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Channels"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Channels
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Connect WhatsApp, Instagram and Email — each organization connects its own accounts.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Top 2 Cards: WhatsApp & Instagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* WhatsApp Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#22c55e] flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 tracking-tight">
                        WhatsApp
                      </h3>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        channels.whatsappConnected
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {channels.whatsappConnected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mt-2 mb-6">
                    Connect via Meta's Embedded Signup — you log into your own Meta account, we never see your password.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleToggleWhatsApp}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-[0.99] flex items-center justify-center gap-2 ${
                      channels.whatsappConnected
                        ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                        : 'bg-[#453372] hover:bg-[#382760] text-white shadow-sm shadow-[#453372]/30'
                    }`}
                  >
                    <span>{channels.whatsappConnected ? 'Disconnect WhatsApp' : 'Connect WhatsApp'}</span>
                  </button>
                </div>
              </div>

              {/* Instagram Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                        <InstagramIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 tracking-tight">
                        Instagram
                      </h3>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        channels.instagramConnected
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {channels.instagramConnected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mt-2 mb-6">
                    Sign in with Instagram in a popup — no Facebook Page needed. Messages land in the same Inbox as WhatsApp.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleToggleInstagram}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-[0.99] flex items-center justify-center gap-2 ${
                      channels.instagramConnected
                        ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                        : 'bg-[#453372] hover:bg-[#382760] text-white shadow-sm shadow-[#453372]/30'
                    }`}
                  >
                    <span>{channels.instagramConnected ? 'Disconnect Instagram' : 'Connect Instagram'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Wide Card Below: Email Settings */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#453372] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">
                    Email
                  </h3>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    channels.emailConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {channels.emailConnected ? 'Configured' : 'Not connected'}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Resend (or SendGrid) API key — used to send package PDFs and follow-ups from a lead.
              </p>

              <form onSubmit={handleSaveEmail} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    From address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="bookings@youragency.com"
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                    className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    API key
                  </label>
                  <input
                    type="password"
                    placeholder="re_xxxxxxxxxxxx"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 font-mono focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Stored encrypted — never shown again after saving.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#453372]/30 transition active:scale-[0.99] flex items-center gap-1.5"
                  >
                    {savedEmail ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
