import { v4 as uuid } from 'uuid'

import { supabase } from '@/lib/supabase'
import type { Contribution } from '@/types'

export async function getContributionsByGoal(goalId: string): Promise<Contribution[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('goal_id', goalId)
    .order('date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getContributionById(id: string): Promise<Contribution | null> {
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export async function createContribution(
  data: Omit<Contribution, 'id'>,
): Promise<Contribution> {
  const contribution: Contribution = { id: uuid(), ...data }

  const { error } = await supabase
    .from('contributions')
    .insert({
      id: contribution.id,
      goal_id: contribution.goal_id,
      amount: contribution.amount,
      date: contribution.date,
    })

  if (error) throw error

  const { data: goal, error: goalError } = await supabase
    .from('savings_goals')
    .select('current_amount')
    .eq('id', contribution.goal_id)
    .single()

  if (goalError) throw goalError

  const { error: updateError } = await supabase
    .from('savings_goals')
    .update({ current_amount: goal.current_amount + contribution.amount })
    .eq('id', contribution.goal_id)

  if (updateError) throw updateError

  return contribution
}

export async function deleteContribution(id: string): Promise<void> {
  const contribution = await getContributionById(id)

  if (contribution) {
    const { data: goal } = await supabase
      .from('savings_goals')
      .select('current_amount')
      .eq('id', contribution.goal_id)
      .single()

    if (goal) {
      await supabase
        .from('savings_goals')
        .update({ current_amount: Math.max(0, goal.current_amount - contribution.amount) })
        .eq('id', contribution.goal_id)
    }
  }

  const { error } = await supabase
    .from('contributions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getTotalContributions(goalId: string): Promise<number> {
  const { data, error } = await supabase
    .from('contributions')
    .select('amount')
    .eq('goal_id', goalId)

  if (error) throw error

  return data.reduce((sum: number, c: any) => sum + c.amount, 0)
}
