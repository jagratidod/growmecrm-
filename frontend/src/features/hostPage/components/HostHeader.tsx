import React from 'react'
import { ExternalLink } from 'lucide-react'
import { useHostPage } from '../../../context/HostPageContext'

export const HostHeader: React.FC = () => {
  const { setIsPublicPreviewOpen } = useHostPage()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Host Page
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Your public mini-website — hero banner, bio, all your packages, reviews and contact.
        </p>
      </div>

      <button
        onClick={() => setIsPublicPreviewOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow transition-all active:scale-[0.98] shrink-0 cursor-pointer"
      >
        <ExternalLink className="w-4 h-4" />
        <span>Open website</span>
      </button>
    </div>
  )
}
