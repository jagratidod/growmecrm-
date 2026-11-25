import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../components/ui/Toast'
import {
  MessageCircle,
  Mail,
  Menu,
  Check,
  Copy,
  Globe,
  Webhook,
} from 'lucide-react'

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

const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
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

  // Webhook integration state
  const [activeTab, setActiveTab] = useState<'website' | 'facebook' | 'whatsapp' | 'instagram'>('website')
  const [copiedUrl, setCopiedUrl] = useState(false)

  const webhookUrl = `${window.location.origin}/api/webhooks/lead`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch {
      toast({ type: 'error', title: 'Could not copy webhook URL' })
    }
  }

  const handleToggleWhatsApp = () => {
    toggleChannel('whatsapp')
    toast({
      type: channels.whatsappConnected ? 'info' : 'success',
      title: 'WhatsApp preference updated',
      description: channels.whatsappConnected
        ? 'WhatsApp preference disabled.'
        : 'WhatsApp preference updated.',
    })
  }

  const handleToggleInstagram = () => {
    toggleChannel('instagram')
    toast({
      type: channels.instagramConnected ? 'info' : 'success',
      title: 'Instagram preference updated',
      description: channels.instagramConnected
        ? 'Instagram preference disabled.'
        : 'Instagram preference updated.',
    })
  }

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault()
    updateEmailConfig(fromAddress, apiKey)
    setSavedEmail(true)
    toast({
      type: 'success',
      title: 'Email Settings Saved',
      description: 'Sender preferences updated.',
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
                  Manage channel preferences and configure lead webhooks.
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
                      {channels.whatsappConnected ? 'Enabled' : 'Disabled'}
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
                    <span>{channels.whatsappConnected ? 'Disable WhatsApp preference' : 'Enable WhatsApp preference'}</span>
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
                      {channels.instagramConnected ? 'Enabled' : 'Disabled'}
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
                    <span>{channels.instagramConnected ? 'Disable Instagram preference' : 'Enable Instagram preference'}</span>
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

            {/* Webhooks & Inbound Lead Ingestion Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Webhook className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">
                      Lead Ingestion Webhooks & APIs
                    </h3>
                    <p className="text-xs text-slate-400">
                      Receive leads automatically from Website forms, Meta Lead Ads (Facebook & Instagram), and WhatsApp
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Endpoint Live
                  </span>
                </div>
              </div>

              {/* Endpoint URL Box */}
              <div className="mb-6 p-4 bg-[#f8f9fc] border border-slate-200/80 rounded-2xl">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Your Universal Ingestion Webhook URL:</span>
                  <span className="text-[10px] uppercase font-mono text-slate-400">POST Request</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-mono text-indigo-600 select-all overflow-x-auto whitespace-nowrap">
                    {webhookUrl}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>

              {/* Platform Integration Guide Tabs */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="flex border-b border-slate-200 bg-[#f8f9fc] overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('website')}
                    className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                      activeTab === 'website'
                        ? 'border-[#453372] text-[#453372] bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>1. Website Form (HTML/JS)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('facebook')}
                    className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                      activeTab === 'facebook'
                        ? 'border-[#453372] text-[#453372] bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FacebookIcon className="w-4 h-4" />
                    <span>2. Facebook & Instagram Ads</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('whatsapp')}
                    className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                      activeTab === 'whatsapp'
                        ? 'border-[#453372] text-[#453372] bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>3. WhatsApp Webhook</span>
                  </button>
                </div>

                <div className="p-5 text-xs text-slate-700">
                  {activeTab === 'website' && (
                    <p className="leading-relaxed">
                      Send enquiry submissions from your website server using your workspace’s webhook configuration.
                      For websites managed in GrowMe, use the form key from your site’s settings.
                    </p>
                  )}

                  {activeTab === 'facebook' && (
                    <div className="space-y-3 leading-relaxed">
                      <p className="font-semibold text-slate-800">
                        How to connect Facebook Lead Ads & Instagram Instant Forms:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-slate-600">
                        <li>
                          <strong className="text-slate-800">Option A - Via Pabbly / Zapier (Recommended, 5 Mins):</strong>
                          <div className="pl-4 mt-1 text-[11px] text-slate-500 space-y-1">
                            • Trigger: <strong>Facebook Lead Ads</strong> (Select your Page & Lead Form)
                            <br />
                            • Action: <strong>Webhook / API POST</strong>
                            <br />
                            • URL: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">{webhookUrl}</code>
                            <br />
                            • Field Mapping: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">name</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">phone</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">source = "Facebook"</code> (or "Instagram").
                          </div>
                        </li>
                        <li>
                          <strong className="text-slate-800">Option B - Direct Meta Webhook:</strong>
                          <div className="pl-4 mt-1 text-[11px] text-slate-500">
                            Configure Webhook URL: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">{window.location.origin}/api/webhooks/meta</code> with Verify Token: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">growme_crm_verify_token</code>.
                          </div>
                        </li>
                      </ol>
                    </div>
                  )}

                  {activeTab === 'whatsapp' && (
                    <div className="space-y-3 leading-relaxed">
                      <p className="font-semibold text-slate-800">
                        How to connect WhatsApp Inbound Enquiries:
                      </p>
                      <div className="space-y-2 text-slate-600">
                        <p>
                          <strong>1. Using Wati / AiSensy / Interakt / Twilio:</strong>
                          <br />
                          In your WhatsApp provider dashboard, navigate to <em>Webhooks & Integrations</em>, enable inbound message notifications, and set Webhook URL to:
                          <br />
                          <code className="inline-block mt-1 bg-slate-100 px-2 py-1 rounded font-mono text-indigo-600">
                            {webhookUrl}
                          </code>
                        </p>
                        <p>
                          <strong>2. Using Meta WhatsApp Cloud API:</strong>
                          <br />
                          In Meta App Dashboard &gt; WhatsApp &gt; Configuration, set Callback URL to:
                          <br />
                          <code className="inline-block mt-1 bg-slate-100 px-2 py-1 rounded font-mono text-indigo-600">
                            {window.location.origin}/api/webhooks/whatsapp
                          </code>
                          <br />
                          with Verify Token: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">growme_crm_verify_token</code>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
