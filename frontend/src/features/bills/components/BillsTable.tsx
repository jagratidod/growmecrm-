import React, { useState } from 'react'
import {
  Calendar,
  Building2,
  Plane,
  Car,
  Compass,
  FileCheck2,
  Shield,
  Briefcase,
  Trash2,
  CreditCard,
  Check,
} from 'lucide-react'
import { useBills } from '../../../context/BillsContext'
import type { BillCategory, BillStatus } from '../../../types/bill.types'

export const BillsTable: React.FC = () => {
  const { filteredBills, deleteBill, recordPayment } = useBills()
  const [payingBillId, setPayingBillId] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState('')

  const categoryIcons: Record<BillCategory, React.ComponentType<{ className?: string }>> = {
    Hotel: Building2,
    Flight: Plane,
    Transport: Car,
    Sightseeing: Compass,
    Visa: FileCheck2,
    Insurance: Shield,
    General: Briefcase,
  }

  const statusBadgeConfig: Record<BillStatus, { bg: string; text: string; dot: string }> = {
    Paid: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-[#22c55e]',
    },
    Partial: {
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-[#453372]',
      dot: 'bg-[#453372]',
    },
    Unpaid: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-[#ffb800]',
    },
  }

  const formatCurrency = (val: number) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN')
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const handlePaySubmit = (billId: string, maxRemaining: number) => {
    const amount = Number(payAmount)
    if (!amount || amount <= 0) return
    recordPayment(billId, Math.min(amount, maxRemaining))
    setPayingBillId(null)
    setPayAmount('')
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-[#f3f4f8] text-[#453372] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Vendor & Category</th>
              <th className="py-3 px-4">Linked Trip</th>
              <th className="py-3 px-4">Bill Date</th>
              <th className="py-3 px-4">Payment Progress</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBills.map((bill) => {
              const CategoryIcon = categoryIcons[bill.category] || Briefcase
              const statusCfg = statusBadgeConfig[bill.status] || statusBadgeConfig.Unpaid
              const balanceDue = Math.max(0, (bill.totalAmount || 0) - (bill.amountPaid || 0))
              const percentPaid = Math.min(
                100,
                Math.round(((bill.amountPaid || 0) / (bill.totalAmount || 1)) * 100)
              )
              const isPaying = payingBillId === bill.id

              return (
                <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Vendor & Category Column */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#453372] flex items-center justify-center shrink-0 shadow-xs">
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">
                          {bill.vendor}
                        </span>
                        <span className="inline-block text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5">
                          {bill.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Linked Trip Column */}
                  <td className="py-3.5 px-4">
                    {bill.linkedTripName ? (
                      <span className="font-semibold text-slate-700 block truncate max-w-[180px]">
                        {bill.linkedTripName}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">General cost</span>
                    )}
                  </td>

                  {/* Bill Date Column */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(bill.billDate)}</span>
                    </div>
                  </td>

                  {/* Payment Progress Column */}
                  <td className="py-3.5 px-4 min-w-[160px]">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-extrabold text-slate-800">
                        {formatCurrency(bill.totalAmount)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {percentPaid}% paid
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentPaid === 100
                            ? 'bg-[#22c55e]'
                            : percentPaid > 0
                            ? 'bg-[#453372]'
                            : 'bg-slate-200'
                        }`}
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Paid: {formatCurrency(bill.amountPaid)}</span>
                      {balanceDue > 0 && (
                        <span className="text-amber-600 font-semibold">
                          Due: {formatCurrency(balanceDue)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Badge Column */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      <span>{bill.status}</span>
                    </span>
                  </td>

                  {/* Action Column */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {balanceDue > 0 && !isPaying && (
                        <button
                          type="button"
                          onClick={() => {
                            setPayingBillId(bill.id)
                            setPayAmount(String(balanceDue))
                          }}
                          className="px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#453372] text-xs font-bold transition flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay</span>
                        </button>
                      )}

                      {isPaying && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max={balanceDue}
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="w-20 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handlePaySubmit(bill.id, balanceDue)}
                            className="p-1 rounded bg-[#22c55e] text-white"
                            title="Confirm payment"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPayingBillId(null)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete bill for ${bill.vendor}?`)) {
                            deleteBill(bill.id)
                          }
                        }}
                        title="Delete bill"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
