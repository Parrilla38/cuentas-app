import { create } from 'zustand'

import type { Category, Transaction, TransactionType } from '@/types'
import type { CategorySpending, MonthSummary } from '@/database/queries'
import {
  getAllCategories,
  getMonthSummary,
  getSpendingByCategory,
  getTransactionsByMonth,
  createTransaction,
  deleteTransaction,
} from '@/database/queries'
import { supabase } from '@/lib/supabase'

interface TransactionsState {
  isLoading: boolean
  transactions: Transaction[]
  categories: Category[]
  monthSummary: MonthSummary
  categorySpending: CategorySpending[]
  currentMonth: number
  currentYear: number
  filter: TransactionType | 'all'
  searchQuery: string
  loadData: () => Promise<void>
  setMonth: (year: number, month: number) => void
  setFilter: (filter: TransactionType | 'all') => void
  setSearchQuery: (query: string) => void
  addTransaction: (data: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
  filteredTransactions: () => Transaction[]
  subscribeToChanges: () => () => void
}

export const useTransactionsStore = create<TransactionsState>((set, get) => {
  const now = new Date()
  return {
    isLoading: false,
    transactions: [],
    categories: [],
    monthSummary: { income: 0, expense: 0, savings: 0 },
    categorySpending: [],
    currentMonth: now.getMonth() + 1,
    currentYear: now.getFullYear(),
    filter: 'all',
    searchQuery: '',

    loadData: async () => {
      set({ isLoading: true })
      try {
        const { currentYear, currentMonth } = get()
        const [transactions, categories, monthSummary, categorySpending] = await Promise.all([
          getTransactionsByMonth(currentYear, currentMonth),
          getAllCategories(),
          getMonthSummary(currentYear, currentMonth),
          getSpendingByCategory(currentYear, currentMonth),
        ])
        set({ transactions, categories, monthSummary, categorySpending, isLoading: false })
      } catch {
        set({ isLoading: false })
      }
    },

    setMonth: (year, month) => {
      set({ currentYear: year, currentMonth: month })
      get().loadData()
    },

    setFilter: (filter) => {
      set({ filter })
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query })
    },

    addTransaction: async (data) => {
      await createTransaction(data)
      await get().loadData()
    },

    removeTransaction: async (id) => {
      await deleteTransaction(id)
      await get().loadData()
    },

    filteredTransactions: () => {
      const { transactions, filter, searchQuery, categories } = get()
      let result = transactions
      if (filter !== 'all') {
        result = result.filter((t) => t.type === filter)
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        result = result.filter((t) => {
          const cat = categories.find((c) => c.id === t.category_id)
          return (
            t.description.toLowerCase().includes(q) ||
            (t.tag?.toLowerCase().includes(q) ?? false) ||
            (cat?.name.toLowerCase().includes(q) ?? false)
          )
        })
      }
      return result
    },

    subscribeToChanges: () => {
      const channel = supabase
        .channel('transactions-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
          get().loadData()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    },
  }
})
