import { v4 as uuid } from 'uuid'

import { supabase } from '@/lib/supabase'
import type { SavingsGoal } from '@/types'

export async function getAllSavingsGoals(): Promise<SavingsGoal[]> {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getSavingsGoalById(id: string): Promise<SavingsGoal | null> {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export async function getActiveSavingsGoal(): Promise<SavingsGoal | null> {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .lt('current_amount', supabase.rpc('get_target_amount'))
    .order('deadline', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) {
    const { data: allGoals } = await supabase
      .from('savings_goals')
      .select('*')
      .order('deadline', { ascending: true })

    if (!allGoals || allGoals.length === 0) return null

    const active = allGoals.find((g: any) => g.current_amount < g.target_amount)
    return active || null
  }
  return data
}

export async function createSavingsGoal(
  data: Omit<SavingsGoal, 'id'>,
): Promise<SavingsGoal> {
  const goal: SavingsGoal = {
    id: uuid(),
    ...data,
  }

  const { error } = await supabase
    .from('savings_goals')
    .insert({
      id: goal.id,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline,
      color: goal.color,
      icon: goal.icon,
    })

  if (error) throw error
  return goal
}

export async function updateSavingsGoal(
  id: string,
  data: Partial<Omit<SavingsGoal, 'id'>>,
): Promise<void> {
  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.target_amount !== undefined) updateData.target_amount = data.target_amount
  if (data.current_amount !== undefined) updateData.current_amount = data.current_amount
  if (data.deadline !== undefined) updateData.deadline = data.deadline
  if (data.color !== undefined) updateData.color = data.color
  if (data.icon !== undefined) updateData.icon = data.icon

  if (Object.keys(updateData).length === 0) return

  const { error } = await supabase
    .from('savings_goals')
    .update(updateData)
    .eq('id', id)

  if (error) throw error
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id)

  if (error) throw error
}
