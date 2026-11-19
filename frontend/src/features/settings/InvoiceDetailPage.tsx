import React, { useState, useEffect } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../components/ui/Toast'
import {
  Receipt,
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  Image as ImageIcon,
  Menu,
  Check,
} from 'lucide-react'

interface InvoiceDetailPageProps {
  onNavigateMenu?: (menu: string) => void
}

export const InvoiceDetailPage: React.FC<InvoiceDetailPageProps> = ({ onNavigateMenu }) => {
  const { invoiceDetail, updateInvoiceDetail } = useSettings()
  const { toast } = useToast()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Local form state
  const [secondPhone, setSecondPhone] = useState(invoiceDetail.secondPhone || '')
  const [secondEmail, setSecondEmail] = useState(invoiceDetail.secondEmail || '')
  const [state, setState] = useState(invoiceDetail.state || '')
  const [stateCode, setStateCode] = useState(invoiceDetail.stateCode || '')
  const [bankName, setBankName] = useState(invoiceDetail.bankName || '')
  const [bankAccountNumber, setBankAccountNumber] = useState(
    invoiceDetail.bankAccountNumber || ''
  )
  const [ifscCode, setIfscCode] = useState(invoiceDetail.ifscCode || '')
  const [gstin, setGstin] = useState(invoiceDetail.gstin || '')
  const [pan, setPan] = useState(invoiceDetail.pan || '')
  const [hsnSacCode, setHsnSacCode] = useState(invoiceDetail.hsnSacCode || '')
  const [signatureImage, setSignatureImage] = useState(invoiceDetail.signatureImage || '')
  const [signatoryTitle, setSignatoryTitle] = useState(invoiceDetail.signatoryTitle || '')
  const [termsAndConditions, setTermsAndConditions] = useState(
    invoiceDetail.termsAndConditions || ''
  )
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setSecondPhone(invoiceDetail.secondPhone || '')
    setSecondEmail(invoiceDetail.secondEmail || '')
    setState(invoiceDetail.state || '')
    setStateCode(invoiceDetail.stateCode || '')
    setBankName(invoiceDetail.bankName || '')
    setBankAccountNumber(invoiceDetail.bankAccountNumber || '')
    setIfscCode(invoiceDetail.ifscCode || '')
    setGstin(invoiceDetail.gstin || '')
    setPan(invoiceDetail.pan || '')
    setHsnSacCode(invoiceDetail.hsnSacCode || '')
    setSignatureImage(invoiceDetail.signatureImage || '')
    setSignatoryTitle(invoiceDetail.signatoryTitle || '')
    setTermsAndConditions(invoiceDetail.termsAndConditions || '')
  }, [invoiceDetail])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSignatureImage(reader.result)
          toast({ title: 'Signature image uploaded', type: 'success' })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return
    setSignatureImage(urlInput.trim())
    setUrlInput('')
    setShowUrlInput(false)
    toast({ title: 'Signature image URL applied', type: 'success' })
  }

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault()

    updateInvoiceDetail({
      secondPhone,
      secondEmail,
      state,
      stateCode,
      bankName,
      bankAccountNumber,
      ifscCode,
      gstin,
      pan,
      hsnSacCode,
      signatureImage,
      signatoryTitle,
      termsAndConditions,
    })

    setIsSaved(true)
    toast({
      type: 'success',
      title: 'Tax Invoice Details Saved',
      description: 'Your invoice details have been updated across all generated tax invoices.',
    })
    setTimeout(() => setIsSaved(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      {/* Sidebar with active Invoice Detail tab cutout */}
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Invoice Detail"
        onSelectMenu={onNavigateMenu}
      />

      {/* Main CRM Application Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
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
            <span className="font-bold text-sm text-slate-900">Invoice Detail</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-5xl w-full mx-auto space-y-6 pb-12">
          {/* Header Bar matching screenshot 1 */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Invoice Detail
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Bank, tax and signature details printed on every Tax Invoice.
            </p>
          </div>

          {/* Form Card matching screenshots 1 & 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSaveChanges} className="space-y-6">
              {/* Card Header */}
              <div className="space-y-1.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-[#453372] border border-purple-200 flex items-center justify-center">
                    <Receipt className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Tax invoice details
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Printed on every Tax Invoice — header, payment box, and footer. Registered
                  office address, phone, and email come from Host Page settings; everything below
                  is invoice-specific. Leave anything blank and it simply won't appear on the
                  invoice.
                </p>
              </div>

              {/* Row 1: Second Phone & Second Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    Second phone number
                  </label>
                  <input
                    type="text"
                    value={secondPhone}
                    onChange={(e) => setSecondPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                  <p className="text-xs text-slate-400">
                    Shown alongside your main phone in the header.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    Second email
                  </label>
                  <input
                    type="email"
                    value={secondEmail}
                    onChange={(e) => setSecondEmail(e.target.value)}
                    placeholder="accounts@agency.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Row 2: State & State Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                  <p className="text-xs text-slate-400">
                    Used as the Place of Supply on every invoice.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    State code
                  </label>
                  <input
                    type="text"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    placeholder="27"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Row 3: Bank Name & Bank Account Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    Bank name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="HDFC Bank, Andheri branch"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    Bank account number
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="50100123456789"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Row 4: IFSC Code & GSTIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    IFSC code
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="HDFC0001234"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Row 5: PAN & HSN/SAC Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    PAN
                  </label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    placeholder="AAAAA0000A"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    HSN / SAC code
                  </label>
                  <input
                    type="text"
                    value={hsnSacCode}
                    onChange={(e) => setHsnSacCode(e.target.value)}
                    placeholder="998552"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                </div>
              </div>

              {/* Row 6: Signature Image & Signatory Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    Signature image
                  </label>

                  {signatureImage ? (
                    <div className="w-full h-32 rounded-2xl border border-slate-200 relative group overflow-hidden bg-slate-50 flex items-center justify-center p-3 shadow-2xs">
                      <img
                        src={signatureImage}
                        alt="Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="p-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 cursor-pointer shadow-xs">
                          <ImageIcon className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setSignatureImage('')}
                          className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
                          title="Remove signature"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 hover:border-purple-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/40 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#453372] border border-purple-100 flex items-center justify-center mb-2 shadow-2xs pointer-events-none">
                        <UploadCloud className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 pointer-events-none">
                        Upload image
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 pointer-events-none">
                        Drag & drop or click · PNG/JPG/WEBP · max 5 MB
                      </p>
                    </div>
                  )}

                  <div className="pt-0.5">
                    {showUrlInput ? (
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="url"
                          placeholder="https://example.com/signature.png"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#453372]/20"
                        />
                        <button
                          type="button"
                          onClick={handleApplyUrl}
                          className="px-3 py-1.5 rounded-lg bg-[#453372] text-white text-xs font-semibold"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="text-xs text-[#453372] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>or paste an image URL</span>
                      </button>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Shown above your signatory's name on the invoice.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                    Signatory title
                  </label>
                  <input
                    type="text"
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    placeholder="Director"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white"
                  />
                  <p className="text-xs text-slate-400">e.g. "Director", "Proprietor"</p>
                </div>
              </div>

              {/* Row 7: Invoice Terms & Conditions */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                  Invoice terms & conditions
                </label>
                <textarea
                  rows={4}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  placeholder="We declare that there is no tax payable under reverse charge mechanism..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition-all bg-white resize-y"
                />
                <p className="text-xs text-slate-400">
                  Printed at the bottom of every Tax Invoice — kept separate from your package
                  cancellation policy.
                </p>
              </div>

              {/* Footer Save Button matching screenshot 2 */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#453372] hover:bg-[#37275d] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Save tax invoice details</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
