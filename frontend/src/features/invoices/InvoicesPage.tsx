import React, { useState, useEffect, useCallback } from 'react'
import { LeadsSidebar } from '../leads/components/LeadsSidebar'
import { useSettings } from '../../context/SettingsContext'
import { useToast } from '../../components/ui/Toast'
import { invoicesService, type InvoiceItem } from '../../services/invoicesService'
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Menu,
  X,
  Trash2,
} from 'lucide-react'

interface InvoicesPageProps {
  onNavigateMenu?: (menu: string) => void
}

type InvoiceRecord = InvoiceItem

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ onNavigateMenu }) => {
  const { invoiceDetail: invoice, organization: org } = useSettings()
  const { toast } = useToast()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all')

  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    const saved = localStorage.getItem('treki_crm_tax_invoices')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'inv-1',
        invoiceNumber: 'INV-2026-001',
        customerName: 'Rahul Sharma',
        customerPhone: '+91 98765 43210',
        destination: '5D/4N Kashmir Paradise Tour',
        issueDate: '2026-11-15',
        dueDate: '2026-11-25',
        totalAmount: 64000,
        paidAmount: 64000,
        status: 'paid',
      },
      {
        id: 'inv-2',
        invoiceNumber: 'INV-2026-002',
        customerName: 'Ananya Deshmukh',
        customerPhone: '+91 98111 22334',
        destination: 'Goa Premium Beachfront Villa',
        issueDate: '2026-11-18',
        dueDate: '2026-11-22',
        totalAmount: 48500,
        paidAmount: 20000,
        status: 'partial',
      },
      {
        id: 'inv-3',
        invoiceNumber: 'INV-2026-003',
        customerName: 'Vikram & Aarti Mehta',
        customerPhone: '+91 99887 76655',
        destination: 'Dubai Luxury Desert & City Tour',
        issueDate: '2026-11-19',
        dueDate: '2026-11-28',
        totalAmount: 145000,
        paidAmount: 0,
        status: 'unpaid',
      },
    ]
  })

  // Fetch invoices from API
  const fetchInvoices = useCallback(async () => {
    try {
      const res = await invoicesService.getInvoices()
      if (res?.invoices && res.invoices.length > 0) {
        setInvoices(res.invoices)
        localStorage.setItem('treki_crm_tax_invoices', JSON.stringify(res.invoices))
      }
    } catch {
      // Keep local storage fallback
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // Modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null)

  // Form state
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [tripName, setTripName] = useState('')
  const [amount, setAmount] = useState('45000')
  const [dueDate, setDueDate] = useState('2026-11-30')

  const saveInvoices = (records: InvoiceRecord[]) => {
    setInvoices(records)
    localStorage.setItem('treki_crm_tax_invoices', JSON.stringify(records))
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextNum = `INV-2026-00${invoices.length + 1}`
    const tempId = `inv-${Date.now()}`
    const newRec: InvoiceRecord = {
      id: tempId,
      invoiceNumber: nextNum,
      customerName: custName || 'Valued Traveller',
      customerPhone: custPhone || '+91 98765 00000',
      destination: tripName || 'Custom Travel Package',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate,
      totalAmount: parseFloat(amount) || 0,
      paidAmount: 0,
      status: 'unpaid',
    }

    const updated = [newRec, ...invoices]
    saveInvoices(updated)
    setIsNewModalOpen(false)
    setCustName('')
    setCustPhone('')
    setTripName('')

    toast({
      type: 'success',
      title: 'Tax Invoice Created',
      description: `Generated invoice ${nextNum} for ${newRec.customerName}.`,
    })

    try {
      const res = await invoicesService.createInvoice({
        customerName: newRec.customerName,
        customerPhone: newRec.customerPhone,
        destination: newRec.destination,
        dueDate: newRec.dueDate,
        totalAmount: newRec.totalAmount,
      })
      if (res?.invoice) {
        setInvoices((prev) => prev.map((inv) => (inv.id === tempId ? res.invoice : inv)))
      }
    } catch {
      // offline fallback
    }
  }

  const handleMarkPaid = async (id: string) => {
    const updated = invoices.map((inv) => {
      if (inv.id === id) {
        return {
          ...inv,
          paidAmount: inv.totalAmount,
          status: 'paid' as const,
        }
      }
      return inv
    })
    saveInvoices(updated)
    toast({
      type: 'success',
      title: 'Payment Recorded',
      description: 'Invoice marked fully paid.',
    })

    try {
      await invoicesService.recordPayment(id, { markFull: true })
    } catch {
      // offline fallback
    }
  }

  const handleDeleteInvoice = async (id: string, num: string) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${num}?`)) return
    const prev = [...invoices]
    const updated = invoices.filter((inv) => inv.id !== id)
    saveInvoices(updated)
    toast({
      type: 'info',
      title: 'Invoice Deleted',
      description: `Invoice ${num} removed.`,
    })

    try {
      await invoicesService.deleteInvoice(id)
    } catch {
      setInvoices(prev)
      toast({ type: 'error', title: 'Delete Failed' })
    }
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.destination.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (statusFilter === 'all') return true
    return inv.status === statusFilter
  })

  const totalBilled = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0)
  const totalCollected = invoices.reduce((acc, curr) => acc + curr.paidAmount, 0)
  const totalPending = totalBilled - totalCollected

  return (
    <div className="min-h-screen bg-[#f3f4f8] flex text-slate-800 font-sans">
      <LeadsSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        currentPath="Invoices"
        onSelectMenu={onNavigateMenu}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Invoices
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Client tax invoices, payment receipts, and GST compliance records.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#453372] text-white font-semibold text-xs shadow-md hover:bg-[#382860] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New invoice</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500">Total Billed</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#453372] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-800">
                ₹{totalBilled.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-emerald-600">Collected</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600">
                ₹{totalCollected.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-amber-600">Pending Balance</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600">
                ₹{totalPending.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice # or traveller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#453372] transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['all', 'paid', 'partial', 'unpaid'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-[#453372] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices Table Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Traveller</th>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                        No invoices found. Click "+ New invoice" to generate one.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-bold text-[#453372]">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{inv.customerName}</p>
                          <p className="text-[11px] text-slate-400">{inv.customerPhone}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {inv.destination}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{inv.dueDate}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800">
                            ₹{inv.totalAmount.toLocaleString('en-IN')}
                          </p>
                          {inv.status === 'partial' && (
                            <p className="text-[10px] text-emerald-600">
                              Paid ₹{inv.paidAmount.toLocaleString('en-IN')}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : inv.status === 'partial'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPreviewInvoice(inv)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#453372] hover:bg-purple-50 transition cursor-pointer"
                              title="View & Print Invoice"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            {inv.status !== 'paid' && (
                              <button
                                onClick={() => handleMarkPaid(inv.id)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* New Invoice Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Generate Tax Invoice</h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Customer / Traveller Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Package / Destination *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6D/5N Manali & Solang Valley Special"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#453372]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#453372] hover:bg-[#382860] rounded-xl shadow-md transition cursor-pointer"
                >
                  Generate invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Invoice Print / Preview Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">
                TAX INVOICE
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#453372] text-xs font-semibold hover:bg-purple-100 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Printable View */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-800">{org.agencyName && org.agencyName !== 'Treki Travels' ? org.agencyName : 'GrowMe CRM'}</h3>
                  <p className="text-xs text-slate-500">Travel & Holiday Specialists</p>
                  <p className="text-xs text-slate-500">State: {invoice.state} (Code: {invoice.stateCode})</p>
                  <p className="text-xs text-slate-500">GSTIN: {invoice.gstin || '27AAAAA0000A1Z5'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-[#453372]">{previewInvoice.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">Date: {previewInvoice.issueDate}</p>
                  <p className="text-xs text-slate-500">Due: {previewInvoice.dueDate}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Billed To
                </p>
                <p className="text-sm font-bold text-slate-800">{previewInvoice.customerName}</p>
                <p className="text-xs text-slate-600">{previewInvoice.customerPhone}</p>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr>
                    <td className="py-3 font-semibold text-slate-800">
                      {previewInvoice.destination}
                      <p className="text-[11px] font-normal text-slate-400">
                        SAC Code: {invoice.hsnSacCode || '998552'} (Tour Operator Services)
                      </p>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-800">
                      ₹{previewInvoice.totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="font-bold">
                    <td className="py-2 text-right text-slate-600">Total:</td>
                    <td className="py-2 text-right text-[#453372] text-sm">
                      ₹{previewInvoice.totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Bank & Signature Details from Invoice Settings */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div>
                  <p className="font-bold text-slate-700 mb-1">Bank Payment Details:</p>
                  <p>Bank: {invoice.bankName}</p>
                  <p>A/C: {invoice.bankAccountNumber}</p>
                  <p>IFSC: {invoice.ifscCode}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700 mb-6">For {org.agencyName}:</p>
                  <p className="font-bold text-slate-800">{invoice.signatoryTitle || 'Authorized Signatory'}</p>
                </div>
              </div>

              {/* Terms */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {invoice.termsAndConditions ||
                    'We declare that there is no tax payable under reverse charge mechanism.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
