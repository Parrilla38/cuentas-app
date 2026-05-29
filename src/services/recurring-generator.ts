import { v4 as uuid } from 'uuid'

import { supabase } from '@/lib/supabase'

export async function generateRecurringTransactions(): Promise<number> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  const { data: existing, error: existingError } = await supabase
    .from('transactions')
    .select('recurring_id')
    .not('recurring_id', 'is', null)
    .like('date', `${monthStr}%`)

  if (existingError) throw existingError

  const existingIds = new Set(existing?.map((r: any) => r.recurring_id) || [])

  const { data: recurring, error: recurringError } = await supabase
    .from('recurring_expenses')
    .select('id, amount, day_of_month, category_id, description')
    .eq('active', true)

  if (recurringError) throw recurringError

  let generated = 0

  for (const expense of recurring || []) {
    if (existingIds.has(expense.id)) continue

    const day = Math.min(expense.day_of_month, getDaysInMonth(year, month))
    const date = `${monthStr}-${String(day).padStart(2, '0')}`

    const id = uuid()
    const { error } = await supabase
      .from('transactions')
      .insert({
        id,
        type: 'expense',
        amount: expense.amount,
        date,
        category_id: expense.category_id,
        description: expense.description,
        loan_id: null,
        tag: null,
        recurring_id: expense.id,
        created_at: new Date().toISOString(),
      })

    if (error) throw error
    generated++
  }

  return generated
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}
