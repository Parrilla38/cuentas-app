import { create } from 'zustand'

import type { Loan, LoanPayment } from '@/types'
import type { LoanWithSummary } from '@/database/queries'
import {
  getAllLoansWithSummary,
  getLoanById,
  getLoanPayments,
  createLoan,
  updateLoan,
  deleteLoan,
  createLoanPayment,
  updateLoanPayment,
  markOverduePayments,
} from '@/database/queries'
import { calculateLoan } from '@/services/loan-calculator'
import { supabase } from '@/lib/supabase'

interface LoansState {
  isLoading: boolean
  loans: LoanWithSummary[]
  selectedLoan: Loan | null
  payments: LoanPayment[]
  loadData: () => Promise<void>
  loadLoanDetail: (id: string) => Promise<void>
  addLoan: (data: Omit<Loan, 'id'>) => Promise<string>
  removeLoan: (id: string) => Promise<void>
  updateLoanStatus: (id: string, status: Loan['status']) => Promise<void>
  addPayment: (data: Omit<LoanPayment, 'id'>) => Promise<void>
  markPaymentPaid: (paymentId: string) => Promise<void>
  generateSchedule: (loanId: string) => Promise<void>
  subscribeToChanges: () => () => void
}

export const useLoansStore = create<LoansState>((set, get) => ({
  isLoading: false,
  loans: [],
  selectedLoan: null,
  payments: [],

  loadData: async () => {
    set({ isLoading: true })
    try {
      await markOverduePayments()
      const loans = await getAllLoansWithSummary()
      set({ loans, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  loadLoanDetail: async (id) => {
    const loan = await getLoanById(id)
    const payments = await getLoanPayments(id)
    set({ selectedLoan: loan, payments })
  },

  addLoan: async (data) => {
    const loan = await createLoan(data)
    await get().loadData()
    return loan.id
  },

  removeLoan: async (id) => {
    await deleteLoan(id)
    await get().loadData()
  },

  updateLoanStatus: async (id, status) => {
    await updateLoan(id, { status })
    await get().loadData()
  },

  addPayment: async (data) => {
    await createLoanPayment(data)
    if (get().selectedLoan) {
      await get().loadLoanDetail(get().selectedLoan!.id)
    }
    await get().loadData()
  },

  markPaymentPaid: async (paymentId) => {
    await updateLoanPayment(paymentId, { status: 'paid' })
    if (get().selectedLoan) {
      await get().loadLoanDetail(get().selectedLoan!.id)
    }
    await get().loadData()
  },

  generateSchedule: async (loanId) => {
    const loan = await getLoanById(loanId)
    if (!loan) return

    const result = calculateLoan(
      loan.principal,
      loan.interest_rate,
      loan.term_months,
      loan.start_date,
      loan.amortization_type,
    )

    for (const row of result.schedule) {
      await createLoanPayment({
        loan_id: loanId,
        amount: row.payment,
        date: row.date,
        is_interest: row.interest > 0,
        is_principal: row.principal > 0,
        status: 'pending',
      })
    }

    await get().loadLoanDetail(loanId)
    await get().loadData()
  },

  subscribeToChanges: () => {
    const channel = supabase
      .channel('loans-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, () => {
        get().loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loan_payments' }, () => {
        get().loadData()
        if (get().selectedLoan) {
          get().loadLoanDetail(get().selectedLoan!.id)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
