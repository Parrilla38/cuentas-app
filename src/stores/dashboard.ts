import { create } from 'zustand'

import type { Category, SavingsGoal, Transaction } from '@/types'
import type { BudgetWithSpending, CategorySpending, MonthSummary, UpcomingPayment } from '@/database/queries'
import {
  getAllCategories,
  getActiveSavingsGoal,
  getBudgetsWithSpending,
  getMonthSummary,
  getSpendingByCategory,
  getTransactionsByMonth,
  getUpcomingPayments,
} from '@/database/queries'
import { supabase } from '@/lib/supabase'

interface DashboardState {
  isLoading: boolean
  transactions: Transaction[]
  categories: Category[]
  monthSummary: MonthSummary
  categorySpending: CategorySpending[]
  budgets: BudgetWithSpending[]
  activeGoal: SavingsGoal | null
  upcomingPayments: UpcomingPayment[]
  currentMonth: number
  currentYear: number
  loadDashboard: () => Promise<void>
  setMonth: (year: number, month: number) => void
  refresh: () => Promise<void>
  subscribeToChanges: () => () => void
}

export const useDashboardStore = create<DashboardState>((set, get) => {
  const now = new Date()
  return {
    isLoading: false,
    transactions: [],
    categories: [],
    monthSummary: { income: 0, expense: 0, savings: 0 },
    categorySpending: [],
    budgets: [],
    activeGoal: null,
    upcomingPayments: [],
    currentMonth: now.getMonth() + 1,
    currentYear: now.getFullYear(),

    loadDashboard: async () => {
      set({ isLoading: true })
      try {
        const { currentYear, currentMonth } = get()
        const [
          transactions,
          categories,
          monthSummary,
          categorySpending,
          budgets,
          activeGoal,
          upcomingPayments,
        ] = await Promise.all([
          getTransactionsByMonth(currentYear, currentMonth),
          getAllCategories(),
          getMonthSummary(currentYear, currentMonth),
          getSpendingByCategory(currentYear, currentMonth),
          getBudgetsWithSpending(currentYear, currentMonth),
          getActiveSavingsGoal(),
          getUpcomingPayments(7),
        ])

        set({
          transactions,
          categories,
          monthSummary,
          categorySpending,
          budgets,
          activeGoal,
          upcomingPayments,
          isLoading: false,
        })
      } catch {
        set({ isLoading: false })
      }
    },

    setMonth: (year: number, month: number) => {
      set({ currentYear: year, currentMonth: month })
      get().loadDashboard()
    },

    refresh: async () => {
      await get().loadDashboard()
    },

    subscribeToChanges: () => {
      const channel = supabase
        .channel('dashboard-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
          get().loadDashboard()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets' }, () => {
          get().loadDashboard()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals' }, () => {
          get().loadDashboard()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
          get().loadDashboard()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    },
  }
})
