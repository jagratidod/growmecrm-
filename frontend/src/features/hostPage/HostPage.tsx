import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { HostHeader } from './components/HostHeader'
import { WebsiteLinkCard } from './components/WebsiteLinkCard'
import { BannerAboutCard } from './components/BannerAboutCard'
import { HostPackagesCard } from './components/HostPackagesCard'
import { HostContactCard } from './components/HostContactCard'
import { HostReviewsCard } from './components/HostReviewsCard'
import { PublicWebsitePreviewModal } from './components/PublicWebsitePreviewModal'
import { Menu } from 'lucide-react'

interface HostPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const HostPage: React.FC<HostPageProps> = ({ onNavigateMenu }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active Host Page tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Host Page"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top App Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#453372] text-white flex items-center justify-center font-bold text-xs">
              TT
            </div>
            <span className="font-bold text-sm text-slate-900">Host Page</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-5xl w-full mx-auto space-y-6 pb-12">
          {/* Header Bar */}
          <HostHeader />

          {/* Your Website Link Card */}
          <WebsiteLinkCard />

          {/* Banner & About Card */}
          <BannerAboutCard />

          {/* Packages Card */}
          <HostPackagesCard
            onNavigatePackages={() => {
              if (onNavigateMenu) onNavigateMenu('Packages')
            }}
          />

          {/* Contact Card */}
          <HostContactCard />

          {/* Reviews Card */}
          <HostReviewsCard />
        </main>
      </div>

      {/* Public Mini-Website Live Preview Modal */}
      <PublicWebsitePreviewModal />
    </div>
  )
}
