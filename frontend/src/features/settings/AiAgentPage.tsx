import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../components/ui/Toast'
import { Bot, Zap, Menu, Check } from 'lucide-react'

interface AiAgentPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const AiAgentPage: React.FC<AiAgentPageProps> = ({ onNavigateMenu }) => {
  const { aiAgent, updateAiAgent } = useSettings()
  const { toast } = useToast()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [tone, setTone] = useState(aiAgent.tone)
  const [systemPrompt, setSystemPrompt] = useState(aiAgent.systemPrompt)
  const [keyFacts, setKeyFacts] = useState(aiAgent.keyFacts)
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateAiAgent({ tone, systemPrompt, keyFacts })
    setSaved(true)
    toast({
      type: 'success',
      title: 'AI Agent Updated',
      description: 'Your agency persona and prompts have been updated across all bot flows.',
    })
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active AI Agent cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="AI Agent"
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
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span>AI Agent</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#453372] border border-purple-200">
                    Smart Assistant
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  How the AI sounds and what it knows about your agency — used by Bot Flow, the Inbox's Suggest Reply / Summarize, and the Package Builder's Generate with AI.
                </p>
              </div>
            </div>
          </div>

          {/* Persona Settings Card matching Screenshot 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs max-w-3xl">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#453372] flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                Persona
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              How the AI should sound and what it knows about your agency.
            </p>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Tone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tone
                </label>
                <input
                  type="text"
                  required
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Friendly, warm and professional"
                  className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  e.g. 'warm and casual' or 'concise and professional'
                </p>
              </div>

              {/* System prompt / instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  System prompt / instructions
                </label>
                <textarea
                  rows={4}
                  required
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are the assistant for Wander & Co. Travel — always mention our 24/7 support line if asked about emergencies..."
                  className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition leading-relaxed"
                />
              </div>

              {/* Key facts about the agency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Key facts about the agency
                </label>
                <textarea
                  rows={4}
                  required
                  value={keyFacts}
                  onChange={(e) => setKeyFacts(e.target.value)}
                  placeholder="We specialise in Kashmir, Ladakh and Himachal packages. Payment: 30% advance, balance before departure."
                  className="w-full bg-[#f3f4f8]/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#453372] focus:ring-2 focus:ring-[#453372]/15 transition leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Pricing policy, popular destinations, anything the AI should reliably know.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#382760] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#453372]/30 transition active:scale-[0.99] flex items-center gap-1.5"
                >
                  {saved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
