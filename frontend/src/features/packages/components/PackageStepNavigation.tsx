import React from 'react'
import { usePackages } from '../../../context/PackagesContext'
import { useToast } from '../../../components/ui/Toast'

export const PackageStepNavigation: React.FC = () => {
  const { currentStep, setCurrentStep } = usePackages()
  const { toast } = useToast()

  const steps = [
    { number: 1, title: 'Basics' },
    { number: 2, title: 'Itinerary' },
    { number: 3, title: 'Logistics' },
    { number: 4, title: 'Policies' },
    { number: 5, title: 'FAQs' },
    { number: 6, title: 'Extra' },
    { number: 7, title: 'Review' },
  ]

  const handleStepClick = (stepNum: number) => {
    if (stepNum === 1 || stepNum === 2) {
      setCurrentStep(stepNum)
    } else {
      toast({
        title: `Step ${stepNum} (${steps[stepNum - 1].title})`,
        description: 'Currently focusing on sections 1 & 2. Next sections will be activated as you provide them!',
        type: 'info',
      })
    }
  }

  return (
    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {steps.map((step) => {
          const isActive = currentStep === step.number

          return (
            <button
              key={step.number}
              type="button"
              onClick={() => handleStepClick(step.number)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#181829] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/70 hover:border-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {step.number}
              </span>
              <span>{step.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
