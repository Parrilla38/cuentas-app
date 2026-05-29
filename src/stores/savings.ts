import { create } from 'zustand'

import type { Contribution, SavingsGoal } from '@/types'
import {
  getAllSavingsGoals,
  getSavingsGoalById,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  getContributionsByGoal,
  createContribution,
  deleteContribution,
} from '@/database/queries'
import { supabase } from '@/lib/supabase'

interface SavingsState {
  isLoading: boolean
  goals: SavingsGoal[]
  selectedGoal: SavingsGoal | null
  contributions: Contribution[]
  loadData: () => Promise<void>
  loadGoalDetail: (id: string) => Promise<void>
  addGoal: (data: Omit<SavingsGoal, 'id'>) => Promise<string>
  removeGoal: (id: string) => Promise<void>
  editGoal: (id: string, data: Partial<Omit<SavingsGoal, 'id'>>) => Promise<void>
  addContribution: (goalId: string, amount: number) => Promise<void>
  removeContribution: (id: string) => Promise<void>
  subscribeToChanges: () => () => void
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  isLoading: false,
  goals: [],
  selectedGoal: null,
  contributions: [],

  loadData: async () => {
    set({ isLoading: true })
    try {
      const goals = await getAllSavingsGoals()
      set({ goals, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  loadGoalDetail: async (id) => {
    const [goal, contributions] = await Promise.all([
      getSavingsGoalById(id),
      getContributionsByGoal(id),
    ])
    set({ selectedGoal: goal, contributions })
  },

  addGoal: async (data) => {
    const goal = await createSavingsGoal(data)
    await get().loadData()
    return goal.id
  },

  removeGoal: async (id) => {
    await deleteSavingsGoal(id)
    await get().loadData()
  },

  editGoal: async (id, data) => {
    await updateSavingsGoal(id, data)
    await get().loadData()
    if (get().selectedGoal?.id === id) {
      await get().loadGoalDetail(id)
    }
  },

  addContribution: async (goalId, amount) => {
    await createContribution({
      goal_id: goalId,
      amount,
      date: new Date().toISOString().split('T')[0],
    })
    await get().loadGoalDetail(goalId)
    await get().loadData()
  },

  removeContribution: async (id) => {
    const { selectedGoal } = get()
    await deleteContribution(id)
    if (selectedGoal) {
      await get().loadGoalDetail(selectedGoal.id)
    }
    await get().loadData()
  },

  subscribeToChanges: () => {
    const channel = supabase
      .channel('savings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals' }, () => {
        get().loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, () => {
        get().loadData()
        if (get().selectedGoal) {
          get().loadGoalDetail(get().selectedGoal!.id)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}))
