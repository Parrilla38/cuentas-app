import { v4 as uuid } from 'uuid'

import { supabase } from '@/lib/supabase'
import type { Budget } from '@/types'

export async function getBudgetsByMonth(year: number, month: number): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('year', year)
    .eq('month', month)

  if (error) throw error
  return data || []
}

export async function getBudgetByCategory(
  categoryId: string,
  year: number,
  month: number,
): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('category_id', categoryId)
    .eq('year', year)
    .eq('month', month)
    .single()

  if (error || !data) return null
  return data
}

export async function getBudgetById(id: string): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export interface BudgetWithSpending extends Budget {
  category_name: string
  category_icon: string
  category_color: string
  spent: number
  percentage: number
}

export async function getBudgetsWithSpending(
  year: number,
  month: number,
): Promise<BudgetWithSpending[]> {
  const { data, error } = await supabase.rpc('get_budgets_with_spending', {
    p_year: year,
    p_month: month,
  })

  if (error) throw error
  return data || []
}

export async function createBudget(data: Omit<Budget, 'id'>): Promise<Budget> {
  const budget: Budget = {
    id: uuid(),
    ...data,
  }

  const { error } = await supabase
    .from('budgets')
    .insert({
      id: budget.id,
      category_id: budget.category_id,
      month: budget.month,
      year: budget.year,
      amount: budget.amount,
    })

  if (error) throw error
  return budget
}

export async function updateBudget(id: string, data: Partial<Omit<Budget, 'id'>>): Promise<void> {
  const updateData: any = {}

  if (data.category_id !== undefined) updateData.category_id = data.category_id
  if (data.month !== undefined) updateData.month = data.month
  if (data.year !== undefined) updateData.year = data.year
  if (data.amount !== undefined) updateData.amount = data.amount

  if (Object.keys(updateData).length === 0) return

  const { error } = await supabase
    .from('budgets')
    .update(updateData)
    .eq('id', id)

  if (error) throw error
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)

  if (error) throw error
}
