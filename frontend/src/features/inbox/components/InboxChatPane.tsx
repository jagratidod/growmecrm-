import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  Paperclip,
  CheckCheck,
  User,
  ArrowLeft,
  Phone,
} from 'lucide-react'
import { useInbox } from '../../../context/InboxContext'

export const InboxChatPane: React.FC = () => {
  const { selectedChat, setSelectedChat, sendMessage } = useInbox()
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedChat?.messages])

  if (!selectedChat) return null

  const handleSend = async () => {
    if (!inputText.trim()) return
    const message = inputText
    try {
      await sendMessage(selectedChat.id, message)
      setInputText((current) => current === message ? '' : current)
    } catch {
      // Keep the text available for retry.
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const channelColor =
    selectedChat.channel === 'whatsapp'
      ? 'bg-[#00a884] hover:bg-[#009374]'
      : 'bg-gradient-to-r from-[#e1306c] to-[#c13584]'

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Top Chat Header */}
      <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedChat(null)}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-brand flex items-center justify-center font-bold text-xs overflow-hidden">
              {selectedChat.contactAvatar ? (
                <img
                  src={selectedChat.contactAvatar}
                  alt={selectedChat.contactName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] ${
                selectedChat.channel === 'whatsapp' ? 'bg-[#00a884]' : 'bg-[#e1306c]'
              }`}
            >
              {selectedChat.channel === 'whatsapp' ? 'W' : 'I'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {selectedChat.contactName}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-brand">
                {selectedChat.stage}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {selectedChat.contactPhone || selectedChat.contactHandle || 'Active enquiry'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedChat.contactPhone && (
            <a
              href={`tel:${selectedChat.contactPhone}`}
              className="p-2 text-slate-500 hover:text-brand hover:bg-slate-100 rounded-xl transition-colors"
              title="Call contact"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#fafbfe]">
        {selectedChat.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
            No messages in this chat yet. Send a message to start!
          </div>
        ) : (
          selectedChat.messages.map((msg) => {
            const isAgent = msg.sender === 'agent'
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isAgent
                      ? 'bg-brand text-white rounded-br-xs'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  {isAgent && (
                    <CheckCheck className="w-3.5 h-3.5 text-purple-400 stroke-[2.5]" />
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Composer */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-end gap-2 shrink-0">
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors shrink-0 mb-0.5"
          title="Attach file / brochure"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <div className="flex-1 relative">
          <textarea
            rows={2}
            placeholder={
              selectedChat.channel === 'whatsapp'
                ? 'Type a WhatsApp message...'
                : 'Type an Instagram message...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim()}
          className={`p-2.5 rounded-xl text-white font-semibold transition-all shrink-0 mb-0.5 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${channelColor}`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
