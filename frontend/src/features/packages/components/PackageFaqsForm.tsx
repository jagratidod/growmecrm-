import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, HelpCircle, Trash2, Plus } from 'lucide-react'
import { usePackages } from '../../../context/PackagesContext'
import { useToast } from '../../../components/ui/Toast'
import type { PackageFaq } from '../../../types/package.types'

interface PackageFaqsFormProps {
  onNext: () => void
  onBack: () => void
}

export const PackageFaqsForm: React.FC<PackageFaqsFormProps> = ({ onNext, onBack }) => {
  const { activePackage, savePackage } = usePackages()
  const { toast } = useToast()

  const [faqs, setFaqs] = useState<PackageFaq[]>(() => {
    if (activePackage?.faqs && activePackage.faqs.length > 0) {
      return activePackage.faqs
    }
    return [
      {
        id: `faq-${Date.now()}-1`,
        question: 'Are flights included in this price?',
        answer: 'Yes, return economy flights from designated departure airports are included.',
      },
      {
        id: `faq-${Date.now()}-2`,
        question: 'What is the visa policy for Indian passport holders?',
        answer: 'Visa on arrival / electronic visa assistance is provided by our operations team.',
      },
    ]
  })

  const handleUpdateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const handleAddFaq = () => {
    const newFaq: PackageFaq = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
    }
    setFaqs((prev) => [...prev, newFaq])
    toast({ title: 'New FAQ added', type: 'info' })
  }

  const handleRemoveFaq = (id: string) => {
    if (faqs.length === 1) {
      toast({ title: 'Keep at least one FAQ entry or leave it blank', type: 'info' })
      return
    }
    setFaqs((prev) => prev.filter((f) => f.id !== id))
    toast({ title: 'FAQ removed', type: 'info' })
  }

  const handleProceed = async () => {
    await savePackage({
      faqs,
    })
    toast({ title: 'FAQs saved successfully', type: 'success' })
    onNext()
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Section Header */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            FREQUENTLY ASKED QUESTIONS
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Answer common questions to reduce back-and-forth.
          </p>
        </div>

        {/* FAQs List matching screenshot */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 relative group"
            >
              {/* Question Row */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Question — e.g. Are flights included?"
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(faq.id, 'question', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] bg-white transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFaq(faq.id)}
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Answer Textarea */}
              <div className="pl-11">
                <textarea
                  rows={3}
                  placeholder="Answer..."
                  value={faq.answer}
                  onChange={(e) => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] resize-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Full-width dashed "+ Add FAQ" button */}
        <div>
          <button
            type="button"
            onClick={handleAddFaq}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#453372]/60 hover:bg-purple-50/20 text-slate-600 hover:text-[#453372] font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Add FAQ</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all active:scale-[0.98]"
        >
          <span>Next: Extra</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
