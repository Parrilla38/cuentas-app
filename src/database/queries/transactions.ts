import { v4 as uuid } from 'uuid'

import { supabase } from '@/lib/supabase'
import type { Transaction, TransactionType } from '@/types'

export async function getAllTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(mapTransaction)
}

export async function getTransactionsByMonth(
  year: number,
  month: number,
): Promise<Transaction[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', startDate)
    .lt('date', endDate)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(mapTransaction)
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return mapTransaction(data)
}

export interface MonthSummary {
  income: number
  expense: number
  savings: number
}

export async function getMonthSummary(
  year: number,
  month: number,
): Promise<MonthSummary> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .gte('date', startDate)
    .lt('date', endDate)

  if (error) throw error

  const income = data
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0)

  const expense = data
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0)

  return {
    income,
    expense,
    savings: income - expense,
  }
}

export interface CategorySpending {
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  amount: number
}

export async function getSpendingByCategory(
  year: number,
  month: number,
): Promise<CategorySpending[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  const { data, error } = await supabase.rpc('get_spending_by_category', {
    start_date: startDate,
    end_date: endDate,
  })

  if (error) throw error
  return data || []
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'created_at'>,
): Promise<Transaction> {
  const transaction: Transaction = {
    id: uuid(),
    ...data,
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('transactions')
    .insert({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
      category_id: transaction.category_id,
      description: transaction.description,
      loan_id: transaction.loan_id,
      tag: transaction.tag,
      recurring_id: transaction.recurring_id,
      created_at: transaction.created_at,
    })

  if (error) throw error
  return transaction
}

export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'created_at'>>,
): Promise<void> {
  const updateData: any = {}

  if (data.type !== undefined) updateData.type = data.type
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.date !== undefined) updateData.date = data.date
  if (data.category_id !== undefined) updateData.category_id = data.category_id
  if (data.description !== undefined) updateData.description = data.description
  if (data.loan_id !== undefined) updateData.loan_id = data.loan_id
  if (data.tag !== undefined) updateData.tag = data.tag
  if (data.recurring_id !== undefined) updateData.recurring_id = data.recurring_id

  if (Object.keys(updateData).length === 0) return

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)

  if (error) throw error
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getTransactionsByCategory(categoryId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('category_id', categoryId)
    .order('date', { ascending: false })

  if (error) throw error
  return data.map(mapTransaction)
}

export async function getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', type)
    .order('date', { ascending: false })

  if (error) throw error
  return data.map(mapTransaction)
}

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    date: row.date,
    category_id: row.category_id,
    description: row.description,
    loan_id: row.loan_id,
    tag: row.tag,
    recurring_id: row.recurring_id,
    created_at: row.created_at,
  }
}
