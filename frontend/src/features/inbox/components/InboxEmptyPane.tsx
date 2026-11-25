import React from 'react'
import { MessageCircle, Send, Plus } from 'lucide-react'
import { useInbox } from '../../../context/InboxContext'

export const InboxEmptyPane: React.FC = () => {
  const { activeChannel, setIsNewChatModalOpen } =
    useInbox()

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
      {activeChannel === 'whatsapp' ? (
        <>
          {/* WhatsApp Icon Circle matching screenshot 2 */}
          <div className="w-24 h-24 rounded-full bg-[#e7fce8] text-[#00a884] flex items-center justify-center mb-5 shadow-xs">
            <MessageCircle className="w-12 h-12 fill-current stroke-[1.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            WhatsApp Inbox
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
            Select a conversation to view messages.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsNewChatModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#009374] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Start new WhatsApp chat</span>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Instagram Send / Paper Airplane Circle matching screenshot 1 */}
          <div className="w-24 h-24 rounded-full border-2 border-slate-800 text-slate-800 flex items-center justify-center mb-5 shadow-xs">
            <Send className="w-10 h-10 -rotate-12 translate-x-0.5 stroke-[1.75]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your messages
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-2 mb-6 leading-relaxed">
            Select a conversation to view messages.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsNewChatModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e1306c] to-[#c13584] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Send Instagram message</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
