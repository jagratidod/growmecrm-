import React from 'react'
import {
  MessageCircle,
  PanelRightClose,
  Maximize2,
  Minimize2,
  Plus,
} from 'lucide-react'
import { InstagramIcon } from './InstagramIcon'
import { useInbox } from '../../../context/InboxContext'

interface InboxHeaderProps {
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export const InboxHeader: React.FC<InboxHeaderProps> = ({
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const { activeChannel, setActiveChannel, setIsNewChatModalOpen } = useInbox()

  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Inbox
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          WhatsApp and Instagram conversations — auto-created from incoming messages.
        </p>
      </div>

      {/* Channel Selector Pills & View Controls Row matching screenshots */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Channel Pills */}
        <div className="flex items-center gap-3">
          {/* WhatsApp Pill */}
          <button
            type="button"
            onClick={() => setActiveChannel('whatsapp')}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeChannel === 'whatsapp'
                ? 'bg-[#00a884] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MessageCircle className="w-4 h-4 fill-current stroke-[1.5]" />
            <span>WhatsApp</span>
          </button>

          {/* Instagram Pill */}
          <button
            type="button"
            onClick={() => setActiveChannel('instagram')}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeChannel === 'instagram'
                ? 'bg-gradient-to-r from-[#e1306c] to-[#c13584] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <InstagramIcon className="w-4 h-4 stroke-[2]" />
            <span>Instagram</span>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewChatModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#453372] text-xs font-semibold border border-purple-200/80 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New chat</span>
          </button>

          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Panel layout"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
