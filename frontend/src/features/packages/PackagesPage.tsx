import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { usePackages } from '../../context/PackagesContext'
import { useToast } from '../../components/ui/Toast'
import { PackagesList } from './components/PackagesList'
import { PackageBuilderHeader } from './components/PackageBuilderHeader'
import { PackageStepNavigation } from './components/PackageStepNavigation'
import { PackageBasicsForm } from './components/PackageBasicsForm'
import { PackageItineraryForm } from './components/PackageItineraryForm'
import { Menu } from 'lucide-react'

interface PackagesPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const PackagesPage: React.FC<PackagesPageProps> = ({ onNavigateMenu }) => {
  const {
    isBuilderOpen,
    setIsBuilderOpen,
    currentStep,
    setCurrentStep,
    activePackage,
    savePackage,
  } = usePackages()
  const { toast } = useToast()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveCurrentPackage = async () => {
    setIsSaving(true)
    try {
      if (activePackage) {
        await savePackage(activePackage)
        toast({ title: 'Package saved successfully', type: 'success' })
      }
    } catch {
      toast({ title: 'Failed to save package', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNextFromBasics = () => {
    setCurrentStep(2)
    toast({
      title: 'Basics saved!',
      description: 'Proceeding to Section 2: Itinerary.',
      type: 'success',
    })
  }

  const handleNextFromItinerary = () => {
    toast({
      title: 'Day-by-day Itinerary saved!',
      description: 'Ready for Section 3 (Logistics) when you share the next screenshots.',
      type: 'success',
    })
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active Packages tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Packages"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* If Package Builder is Open */}
        {isBuilderOpen ? (
          <div className="flex-1 flex flex-col min-h-screen bg-[#f8f9fc]">
            {/* Top Bar matching screenshot 1 */}
            <PackageBuilderHeader
              onBack={() => setIsBuilderOpen(false)}
              onSave={handleSaveCurrentPackage}
              isSaving={isSaving}
            />

            {/* 7 Step Tabs matching screenshot 1 */}
            <PackageStepNavigation />

            {/* Step Wizard Body */}
            <main className="flex-1 pb-16">
              {currentStep === 1 ? (
                <PackageBasicsForm
                  onNext={handleNextFromBasics}
                  onBack={() => setIsBuilderOpen(false)}
                />
              ) : currentStep === 2 ? (
                <PackageItineraryForm
                  onNext={handleNextFromItinerary}
                  onBack={() => setCurrentStep(1)}
                />
              ) : (
                <div className="max-w-3xl mx-auto my-12 bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs">
                  <h3 className="text-base font-bold text-slate-800">
                    Step {currentStep} is coming next
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Please provide the screenshot for this section to unlock it.
                  </p>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="mt-4 px-4 py-2 bg-[#453372] text-white text-xs font-semibold rounded-xl"
                  >
                    ← Back to Itinerary
                  </button>
                </div>
              )}
            </main>
          </div>
        ) : (
          /* Normal Packages Catalog View */
          <>
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
                <span className="font-bold text-sm text-slate-900">Packages</span>
              </div>
              <div className="w-9" />
            </div>

            <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto">
              <PackagesList />
            </main>
          </>
        )}
      </div>
    </div>
  )
}
