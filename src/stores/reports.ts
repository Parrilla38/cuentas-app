import { create } from 'zustand'

import { generateMonthlyReport, type ReportData } from '@/services/report-generator'

interface ReportsState {
  isLoading: boolean
  data: ReportData | null
  currentMonth: number
  currentYear: number
  loadData: () => Promise<void>
  setMonth: (year: number, month: number) => void
}

export const useReportsStore = create<ReportsState>((set, get) => {
  const now = new Date()
  return {
    isLoading: false,
    data: null,
    currentMonth: now.getMonth() + 1,
    currentYear: now.getFullYear(),

    loadData: async () => {
      set({ isLoading: true })
      try {
        const { currentYear, currentMonth } = get()
        const data = await generateMonthlyReport(currentYear, currentMonth)
        set({ data, isLoading: false })
      } catch {
        set({ isLoading: false })
      }
    },

    setMonth: (year, month) => {
      set({ currentYear: year, currentMonth: month })
      get().loadData()
    },
  }
})
