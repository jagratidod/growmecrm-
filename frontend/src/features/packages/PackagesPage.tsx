import React, { useState } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { usePackages } from '../../context/PackagesContext'
import { useToast } from '../../components/ui/Toast'
import { PackagesList } from './components/PackagesList'
import { PackageBuilderHeader } from './components/PackageBuilderHeader'
import { PackageStepNavigation } from './components/PackageStepNavigation'
import { PackageBasicsForm } from './components/PackageBasicsForm'
import { PackageItineraryForm } from './components/PackageItineraryForm'
import { PackageLogisticsForm } from './components/PackageLogisticsForm'
import { PackagePoliciesForm } from './components/PackagePoliciesForm'
import { PackageFaqsForm } from './components/PackageFaqsForm'
import { PackageExtraForm } from './components/PackageExtraForm'
import { PackageReviewStep } from './components/PackageReviewStep'
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
  }

  const handleNextFromItinerary = () => {
    setCurrentStep(3)
  }

  const handleNextFromLogistics = () => {
    setCurrentStep(4)
  }

  const handleNextFromPolicies = () => {
    setCurrentStep(5)
  }

  const handleNextFromFaqs = () => {
    setCurrentStep(6)
  }

  const handleNextFromExtra = () => {
    setCurrentStep(7)
  }

  const handleFinished = () => {
    setIsBuilderOpen(false)
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen bg-canvas flex text-slate-800 font-sans">
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
          <div className="flex-1 flex flex-col min-h-screen bg-canvas">
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
              {currentStep === 1 && (
                <PackageBasicsForm
                  onNext={handleNextFromBasics}
                  onBack={() => setIsBuilderOpen(false)}
                />
              )}
              {currentStep === 2 && (
                <PackageItineraryForm
                  onNext={handleNextFromItinerary}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <PackageLogisticsForm
                  onNext={handleNextFromLogistics}
                  onBack={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 4 && (
                <PackagePoliciesForm
                  onNext={handleNextFromPolicies}
                  onBack={() => setCurrentStep(3)}
                />
              )}
              {currentStep === 5 && (
                <PackageFaqsForm
                  onNext={handleNextFromFaqs}
                  onBack={() => setCurrentStep(4)}
                />
              )}
              {currentStep === 6 && (
                <PackageExtraForm
                  onNext={handleNextFromExtra}
                  onBack={() => setCurrentStep(5)}
                />
              )}
              {currentStep === 7 && (
                <PackageReviewStep
                  onBack={() => setCurrentStep(6)}
                  onFinished={handleFinished}
                />
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
                <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs">
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
