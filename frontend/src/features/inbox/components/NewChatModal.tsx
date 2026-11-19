import React, { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { InstagramIcon } from './InstagramIcon'
import { useInbox } from '../../../context/InboxContext'
import { useToast } from '../../../components/ui/Toast'

export const NewChatModal: React.FC = () => {
  const { isNewChatModalOpen, setIsNewChatModalOpen, activeChannel, startNewChat } = useInbox()
  const { toast } = useToast()

  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactHandle, setContactHandle] = useState('')
  const [initialMessage, setInitialMessage] = useState('')

  if (!isNewChatModalOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactName.trim()) {
      toast({ title: 'Please enter a contact name', type: 'error' })
      return
    }

    startNewChat({
      contactName: contactName.trim(),
      contactPhone: activeChannel === 'whatsapp' ? contactPhone.trim() : undefined,
      contactHandle: activeChannel === 'instagram' ? contactHandle.trim() : undefined,
      initialMessage: initialMessage.trim() || undefined,
    })

    setContactName('')
    setContactPhone('')
    setContactHandle('')
    setInitialMessage('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
                activeChannel === 'whatsapp' ? 'bg-[#00a884]' : 'bg-[#e1306c]'
              }`}
            >
              {activeChannel === 'whatsapp' ? (
                <MessageCircle className="w-4 h-4 fill-current" />
              ) : (
                <InstagramIcon className="w-4 h-4" />
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Start new {activeChannel === 'whatsapp' ? 'WhatsApp' : 'Instagram'} chat
            </h3>
          </div>

          <button
            onClick={() => setIsNewChatModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Contact name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
              autoFocus
            />
          </div>

          {activeChannel === 'whatsapp' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Phone number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Instagram handle
              </label>
              <input
                type="text"
                placeholder="@username"
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Initial message (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Type initial message to send..."
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewChatModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all ${
                activeChannel === 'whatsapp'
                  ? 'bg-[#00a884] hover:bg-[#009374]'
                  : 'bg-gradient-to-r from-[#e1306c] to-[#c13584]'
              }`}
            >
              Start chat
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
