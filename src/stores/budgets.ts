import { create } from 'zustand'

import type { Category } from '@/types'
import type { BudgetWithSpending } from '@/database/queries'
import {
  getAllCategories,
  getBudgetsWithSpending,
  getRecurringExpensesWithCategory,
  createBudget,
  deleteBudget,
} from '@/database/queries'
import { applyTemplate503020 } from '@/services/budget-analyzer'
import { supabase } from '@/lib/supabase'

type RecurringExpenseWithCategory = Awaited<ReturnType<typeof getRecurringExpensesWithCategory>>[number]

interface BudgetsState {
  isLoading: boolean
  budgets: BudgetWithSpending[]
  recurringExpenses: RecurringExpenseWithCategory[]
  categories: Category[]
  currentMonth: number
  currentYear: number
  loadData: () => Promise<void>
  setMonth: (year: number, month: number) => void
  refresh: () => Promise<void>
  applyTemplate: (salary: number) => Promise<void>
  removeBudget: (id: string) => Promise<void>
  subscribeToChanges: () => () => void
}

export const useBudgetsStore = create<BudgetsState>((set, get) => {
  const now = new Date()
  return {
    isLoading: false,
    budgets: [],
    recurringExpenses: [],
    categories: [],
    currentMonth: now.getMonth() + 1,
    currentYear: now.getFullYear(),

    loadData: async () => {
      set({ isLoading: true })
      try {
        const { currentYear, currentMonth } = get()
        const [budgets, recurringExpenses, categories] = await Promise.all([
          getBudgetsWithSpending(currentYear, currentMonth),
          getRecurringExpensesWithCategory(),
          getAllCategories(),
        ])
        set({ budgets, recurringExpenses, categories, isLoading: false })
      } catch {
        set({ isLoading: false })
      }
    },

    setMonth: (year: number, month: number) => {
      set({ currentYear: year, currentMonth: month })
      get().loadData()
    },

    refresh: async () => {
      await get().loadData()
    },

    applyTemplate: async (salary: number) => {
      const { categories, currentYear, currentMonth } = get()
      const expenseCategories = categories.filter((c) => c.type === 'expense')
      const fixedIds = expenseCategories.filter((c) => c.is_fixed).map((c) => c.id)
      const variableIds = expenseCategories.filter((c) => !c.is_fixed).map((c) => c.id)

      const allocations = applyTemplate503020(salary, fixedIds, variableIds)

      const existingBudgets = await getBudgetsWithSpending(currentYear, currentMonth)
      for (const existing of existingBudgets) {
        await deleteBudget(existing.id)
      }

      for (const [categoryId, amount] of allocations) {
        await createBudget({
          category_id: categoryId,
          month: currentMonth,
          year: currentYear,
          amount,
        })
      }

      await get().loadData()
    },

    removeBudget: async (id: string) => {
      await deleteBudget(id)
      await get().loadData()
    },

    subscribeToChanges: () => {
      const channel = supabase
        .channel('budgets-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets' }, () => {
          get().loadData()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_expenses' }, () => {
          get().loadData()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    },
  }
})
