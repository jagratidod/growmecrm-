import { useAuth } from './AuthContext'
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react'
import type { Bill, BillFilters, BillStats } from '../types/bill.types'
import { billsService } from '../services/billsService'

interface BillsContextType {
  bills: Bill[]
  filteredBills: Bill[]
  stats: BillStats
  filters: BillFilters
  setFilters: React.Dispatch<React.SetStateAction<BillFilters>>
  updateFilter: <K extends keyof BillFilters>(key: K, value: BillFilters[K]) => void
  resetFilters: () => void
  addBill: (billData: Omit<Bill, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Bill
  updateBill: (id: string, updates: Partial<Bill>) => void
  deleteBill: (id: string) => void
  recordPayment: (id: string, additionalPaid: number) => void
  isAddBillModalOpen: boolean
  setIsAddBillModalOpen: (open: boolean) => void
  refreshBills: () => Promise<void>
}

const STORAGE_PREFIX = 'treki_crm_bills_data'

const BillsContext = createContext<BillsContextType | undefined>(undefined)

export const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const STORAGE_KEY = `${STORAGE_PREFIX}:${user?.organizationId || 'guest'}`
  const [bills, setBills] = useState<Bill[]>([])

  const [filters, setFilters] = useState<BillFilters>({
    search: '',
    status: 'All',
  })

  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false)

  // Fetch from backend API
  const refreshBills = useCallback(async () => {
    try {
      const res = await billsService.getBills()
      if (res?.bills) {
        setBills(res.bills)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.bills))
      }
    } catch {
      // Keep local cache if offline
    }
  }, [])

  useEffect(() => {
    refreshBills()
  }, [refreshBills])

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bills))
    } catch {
      // ignore
    }
  }, [bills])

  const updateFilter = <K extends keyof BillFilters>(key: K, value: BillFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({ search: '', status: 'All' })
  }

  // Dynamic stats calculation matching Screenshot 2
  const stats = useMemo<BillStats>(() => {
    let totalSpend = 0
    let totalPaid = 0

    bills.forEach((b) => {
      totalSpend += b.totalAmount || 0
      totalPaid += b.amountPaid || 0
    })

    const unpaid = Math.max(0, totalSpend - totalPaid)

    return {
      totalSpend,
      unpaid,
      paid: totalPaid,
    }
  }, [bills])

  // Filtered bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      // Status filter
      if (filters.status === 'Paid' && b.status !== 'Paid') {
        return false
      }
      if (filters.status === 'Unpaid' && b.status === 'Paid') {
        return false
      }

      // Search keyword filter (vendor, linkedTripName, notes)
      if (filters.search) {
        const query = filters.search.toLowerCase()
        const matchesVendor = b.vendor.toLowerCase().includes(query)
        const matchesTrip = b.linkedTripName?.toLowerCase().includes(query)
        const matchesNotes = b.notes?.toLowerCase().includes(query)
        const matchesCategory = b.category.toLowerCase().includes(query)
        if (!matchesVendor && !matchesTrip && !matchesNotes && !matchesCategory) {
          return false
        }
      }

      return true
    })
  }, [bills, filters])

  const determineStatus = (total: number, paid: number): 'Paid' | 'Unpaid' | 'Partial' => {
    if (paid >= total && total > 0) return 'Paid'
    if (paid > 0) return 'Partial'
    return 'Unpaid'
  }

  const addBill = (billData: Omit<Bill, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Bill => {
    const now = new Date().toISOString()
    const status = determineStatus(billData.totalAmount, billData.amountPaid)

    const tempId = 'bill-' + Date.now()
    const newBill: Bill = {
      ...billData,
      id: tempId,
      status,
      createdAt: now,
      updatedAt: now,
    }

    setBills((prev) => [newBill, ...prev])

    // Sync to backend asynchronously
    billsService
      .createBill(billData)
      .then((res) => {
        if (res?.bill) {
          setBills((prev) => prev.map((b) => (b.id === tempId ? res.bill : b)))
        }
      })
      .catch(() => {
        // Fallback already saved locally
      })

    return newBill
  }

  const updateBill = (id: string, updates: Partial<Bill>) => {
    const now = new Date().toISOString()
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const merged = { ...b, ...updates, updatedAt: now }
        merged.status = determineStatus(merged.totalAmount, merged.amountPaid)
        return merged
      })
    )

    billsService.updateBill(id, updates).catch(() => {})
  }

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id))
    billsService.deleteBill(id).catch(() => {})
  }

  const recordPayment = (id: string, additionalPaid: number) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const newPaid = Math.min(b.totalAmount, (b.amountPaid || 0) + additionalPaid)
        return {
          ...b,
          amountPaid: newPaid,
          status: determineStatus(b.totalAmount, newPaid),
          updatedAt: new Date().toISOString(),
        }
      })
    )

    billsService.recordPayment(id, additionalPaid).catch(() => {})
  }

  return (
    <BillsContext.Provider
      value={{
        bills,
        filteredBills,
        stats,
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        addBill,
        updateBill,
        deleteBill,
        recordPayment,
        isAddBillModalOpen,
        setIsAddBillModalOpen,
        refreshBills,
      }}
    >
      {children}
    </BillsContext.Provider>
  )
}

export const useBills = (): BillsContextType => {
  const context = useContext(BillsContext)
  if (!context) {
    throw new Error('useBills must be used within a BillsProvider')
  }
  return context
}
