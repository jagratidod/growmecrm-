import React, { useState } from 'react'
import { Copy, ExternalLink, Globe, Check } from 'lucide-react'
import { useHostPage } from '../../../context/HostPageContext'
import { useToast } from '../../../components/ui/Toast'

export const WebsiteLinkCard: React.FC = () => {
  const { hostData, setIsPublicPreviewOpen } = useHostPage()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hostData.websiteUrl)
      setCopied(true)
      toast({ title: 'Link copied to clipboard!', type: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Failed to copy link', type: 'error' })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
        YOUR WEBSITE LINK
      </label>

      {/* URL bar with Copy and Open buttons matching screenshot 1 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            readOnly
            value={hostData.websiteUrl}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#453372]/20 cursor-text select-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors active:scale-[0.98] cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsPublicPreviewOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open</span>
          </button>
        </div>
      </div>

      {/* Helper text matching screenshot 1 */}
      <div className="flex items-start gap-2 pt-1 text-xs text-slate-500">
        <Globe className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Every package your org has appears automatically. Logo, colours, bio and Instagram come from Organization settings.
        </p>
      </div>
    </div>
  )
}
