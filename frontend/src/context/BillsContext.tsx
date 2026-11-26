import { useRouter } from './RouterContext'
import { useToast } from '../components/ui/Toast'
import { useWorkspace } from '../features/workspace/WorkspaceAccess'
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
  addBill: (billData: Omit<Bill, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<Bill>
  updateBill: (id: string, updates: Partial<Bill>) => void
  deleteBill: (id: string) => void
  recordPayment: (id: string, additionalPaid: number) => void
  isAddBillModalOpen: boolean
  setIsAddBillModalOpen: (open: boolean) => void
  refreshBills: () => Promise<void>
}

const BillsContext = createContext<BillsContextType | undefined>(undefined)

export const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path } = useRouter()
  const enabled = (useWorkspace().access?.modules.includes('finance')) && ('/bills' === path)
  const { toast } = useToast()
  const [bills, setBills] = useState<Bill[]>([])

  const [filters, setFilters] = useState<BillFilters>({
    search: '',
    status: 'All',
  })

  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false)

  // Fetch from backend API
  const refreshBills = useCallback(async () => {
    if (!enabled) return
    try {
      setBills((await billsService.getBills()).bills)
    } catch (error) {
      toast({ type: 'error', title: 'Could not load bills', description: (error as Error).message })
    }
  }, [enabled, toast])

  useEffect(() => {
    void refreshBills()
  }, [refreshBills])

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

  const addBill: BillsContextType['addBill'] = async (data) => {
    const { bill } = await billsService.createBill(data)
    setBills((prev) => [bill, ...prev])
    return bill
  }

  const applyUpdate = async (operation: Promise<{ bill: Bill }>) => {
    try {
      const { bill } = await operation
      setBills((prev) => prev.map((item) => item.id === bill.id ? bill : item))
    } catch (error) {
      toast({ type: 'error', title: 'Could not update bill', description: (error as Error).message })
    }
  }

  const updateBill = (id: string, updates: Partial<Bill>) => applyUpdate(billsService.updateBill(id, updates))
  const recordPayment = (id: string, amount: number) => applyUpdate(billsService.recordPayment(id, amount))

  const deleteBill = async (id: string) => {
    try {
      await billsService.deleteBill(id)
      setBills((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      toast({ type: 'error', title: 'Could not delete bill', description: (error as Error).message })
    }
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
