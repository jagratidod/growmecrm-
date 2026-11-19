import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useToast } from '../../components/ui/Toast'
import {
  GitFork,
  Plus,
  Menu,
  Zap,
} from 'lucide-react'

interface BotFlowsPageProps {
  onNavigateMenu?: (menu: string) => void
}

interface BotFlowItem {
  id: string
  name: string
  description: string
  trigger: string
  stepsCount: number
  channel: 'all' | 'whatsapp' | 'instagram'
  enabled: boolean
}

export const BotFlowsPage: React.FC<BotFlowsPageProps> = ({ onNavigateMenu }) => {
  const { toast } = useToast()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [flows, setFlows] = useState<BotFlowItem[]>(() => {
    const saved = localStorage.getItem('treki_crm_bot_flows')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'flow-1',
        name: 'Instant Inquiry Greeting & Package Selector',
        description:
          'When a new traveller messages on WhatsApp or Instagram, send immediate welcome message and offer package buttons.',
        trigger: 'First message from new phone number or DM',
        stepsCount: 4,
        channel: 'all',
        enabled: true,
      },
      {
        id: 'flow-2',
        name: 'Traveller Budget & Group Size Qualifier',
        description:
          'Ask number of passengers, travel month, and estimated budget per person before assigning to agent.',
        trigger: 'Traveller clicks "Get Quote" button',
        stepsCount: 3,
        channel: 'whatsapp',
        enabled: true,
      },
      {
        id: 'flow-3',
        name: 'After Hours & Late Night Auto-Reply',
        description:
          'Sends friendly out-of-office message outside 9:00 AM - 8:00 PM and promises 9:00 AM follow-up.',
        trigger: 'Message received during off-work hours',
        stepsCount: 2,
        channel: 'all',
        enabled: false,
      },
      {
        id: 'flow-4',
        name: 'Post-Trip Google Review Request',
        description:
          'Automatically messages the traveller 1 day after trip return date asking for 5-star review.',
        trigger: 'Booking status changes to "Trip Completed"',
        stepsCount: 3,
        channel: 'whatsapp',
        enabled: true,
      },
    ]
  })

  const handleToggle = (id: string) => {
    const updated = flows.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    setFlows(updated)
    localStorage.setItem('treki_crm_bot_flows', JSON.stringify(updated))
    const item = updated.find((f) => f.id === id)
    toast({
      type: item?.enabled ? 'success' : 'info',
      title: item?.enabled ? 'Bot Flow Activated' : 'Bot Flow Paused',
      description: `${item?.name} is now ${item?.enabled ? 'live' : 'inactive'}.`,
    })
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Bot Flows"
        onSelectMenu={onNavigateMenu}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span>Bot Flows</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#453372] border border-purple-200">
                    AI Automated
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Conversational automation, lead qualification, and quick-reply triggers for WhatsApp & Instagram.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                toast({
                  type: 'info',
                  title: 'Flow Builder',
                  description: 'Select an existing flow or template to customize your bot actions.',
                })
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#453372] text-white font-semibold text-xs shadow-md hover:bg-[#382860] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create bot flow</span>
            </button>
          </div>

          {/* Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#453372] flex items-center justify-center font-bold">
                        <GitFork className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {flow.channel.toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggle(flow.id)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        flow.enabled ? 'bg-[#453372]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                          flow.enabled ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-slate-800 mb-1.5">{flow.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {flow.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate max-w-[190px]">{flow.trigger}</span>
                  </div>
                  <span className="font-semibold text-slate-600 shrink-0">
                    {flow.stepsCount} steps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
