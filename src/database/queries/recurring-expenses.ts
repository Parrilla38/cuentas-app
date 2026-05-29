import { v4 as uuid } from 'uuid'

import { supabase } from '@/lib/supabase'
import type { RecurringExpense } from '@/types'

export async function getAllRecurringExpenses(): Promise<RecurringExpense[]> {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .order('day_of_month', { ascending: true })

  if (error) throw error
  return (data || []).map(mapRecurringExpense)
}

export async function getActiveRecurringExpenses(): Promise<RecurringExpense[]> {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('active', true)
    .order('day_of_month', { ascending: true })

  if (error) throw error
  return (data || []).map(mapRecurringExpense)
}

export async function getRecurringExpenseById(id: string): Promise<RecurringExpense | null> {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return mapRecurringExpense(data)
}

export interface UpcomingPayment {
  id: string
  amount: number
  day_of_month: number
  description: string
  category_name: string
  category_icon: string
  category_color: string
}

export async function getUpcomingPayments(daysAhead: number): Promise<UpcomingPayment[]> {
  const { data, error } = await supabase.rpc('get_upcoming_payments', {
    days_ahead: daysAhead,
  })

  if (error) throw error
  return data || []
}

export async function createRecurringExpense(
  data: Omit<RecurringExpense, 'id'>,
): Promise<RecurringExpense> {
  const expense: RecurringExpense = {
    id: uuid(),
    ...data,
  }

  const { error } = await supabase
    .from('recurring_expenses')
    .insert({
      id: expense.id,
      amount: expense.amount,
      day_of_month: expense.day_of_month,
      category_id: expense.category_id,
      description: expense.description,
      active: expense.active,
    })

  if (error) throw error
  return expense
}

export async function updateRecurringExpense(
  id: string,
  data: Partial<Omit<RecurringExpense, 'id'>>,
): Promise<void> {
  const updateData: any = {}

  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.day_of_month !== undefined) updateData.day_of_month = data.day_of_month
  if (data.category_id !== undefined) updateData.category_id = data.category_id
  if (data.description !== undefined) updateData.description = data.description
  if (data.active !== undefined) updateData.active = data.active

  if (Object.keys(updateData).length === 0) return

  const { error } = await supabase
    .from('recurring_expenses')
    .update(updateData)
    .eq('id', id)

  if (error) throw error
}

export async function deleteRecurringExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('recurring_expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getRecurringExpensesWithCategory(): Promise<
  (RecurringExpense & { category_name: string; category_icon: string; category_color: string })[]
> {
  const { data, error } = await supabase.rpc('get_recurring_expenses_with_category')

  if (error) throw error

  return (data || []).map((row: any) => ({
    ...mapRecurringExpense(row),
    category_name: row.category_name,
    category_icon: row.category_icon,
    category_color: row.category_color,
  }))
}

function mapRecurringExpense(row: any): RecurringExpense {
  return {
    id: row.id,
    amount: row.amount,
    day_of_month: row.day_of_month,
    category_id: row.category_id,
    description: row.description,
    active: Boolean(row.active),
  }
}
