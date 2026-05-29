import { v4 as uuid } from 'uuid'

import { supabase } from '@/lib/supabase'
import type { Loan, LoanPayment } from '@/types'

export async function getAllLoans(): Promise<Loan[]> {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) throw error
  return data.map(mapLoan)
}

export async function getLoansByType(type: 'given' | 'received'): Promise<Loan[]> {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('type', type)
    .order('start_date', { ascending: false })

  if (error) throw error
  return data.map(mapLoan)
}

export async function getLoanById(id: string): Promise<Loan | null> {
  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return mapLoan(data)
}

export async function createLoan(data: Omit<Loan, 'id'>): Promise<Loan> {
  const loan: Loan = { id: uuid(), ...data }

  const { error } = await supabase
    .from('loans')
    .insert({
      id: loan.id,
      type: loan.type,
      person: loan.person,
      principal: loan.principal,
      interest_rate: loan.interest_rate,
      term_months: loan.term_months,
      start_date: loan.start_date,
      status: loan.status,
      amortization_type: loan.amortization_type,
      description: loan.description,
    })

  if (error) throw error
  return loan
}

export async function updateLoan(
  id: string,
  data: Partial<Omit<Loan, 'id'>>,
): Promise<void> {
  const updateData: any = {}

  if (data.type !== undefined) updateData.type = data.type
  if (data.person !== undefined) updateData.person = data.person
  if (data.principal !== undefined) updateData.principal = data.principal
  if (data.interest_rate !== undefined) updateData.interest_rate = data.interest_rate
  if (data.term_months !== undefined) updateData.term_months = data.term_months
  if (data.start_date !== undefined) updateData.start_date = data.start_date
  if (data.status !== undefined) updateData.status = data.status
  if (data.amortization_type !== undefined) updateData.amortization_type = data.amortization_type
  if (data.description !== undefined) updateData.description = data.description

  if (Object.keys(updateData).length === 0) return

  const { error } = await supabase
    .from('loans')
    .update(updateData)
    .eq('id', id)

  if (error) throw error
}

export async function deleteLoan(id: string): Promise<void> {
  const { error } = await supabase
    .from('loan_payments')
    .delete()
    .eq('loan_id', id)

  if (error) throw error

  const { error: loanError } = await supabase
    .from('loans')
    .delete()
    .eq('id', id)

  if (loanError) throw loanError
}

export async function getLoanPayments(loanId: string): Promise<LoanPayment[]> {
  const { data, error } = await supabase
    .from('loan_payments')
    .select('*')
    .eq('loan_id', loanId)
    .order('date', { ascending: true })

  if (error) throw error
  return data.map(mapLoanPayment)
}

export async function getLoanPaymentById(id: string): Promise<LoanPayment | null> {
  const { data, error } = await supabase
    .from('loan_payments')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return mapLoanPayment(data)
}

export async function createLoanPayment(
  data: Omit<LoanPayment, 'id'>,
): Promise<LoanPayment> {
  const payment: LoanPayment = { id: uuid(), ...data }

  const { error } = await supabase
    .from('loan_payments')
    .insert({
      id: payment.id,
      loan_id: payment.loan_id,
      amount: payment.amount,
      date: payment.date,
      is_interest: payment.is_interest,
      is_principal: payment.is_principal,
      status: payment.status,
    })

  if (error) throw error
  return payment
}

export async function updateLoanPayment(
  id: string,
  data: Partial<Omit<LoanPayment, 'id'>>,
): Promise<void> {
  const updateData: any = {}

  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.date !== undefined) updateData.date = data.date
  if (data.is_interest !== undefined) updateData.is_interest = data.is_interest
  if (data.is_principal !== undefined) updateData.is_principal = data.is_principal
  if (data.status !== undefined) updateData.status = data.status

  if (Object.keys(updateData).length === 0) return

  const { error } = await supabase
    .from('loan_payments')
    .update(updateData)
    .eq('id', id)

  if (error) throw error
}

export async function deleteLoanPayment(id: string): Promise<void> {
  const { error } = await supabase
    .from('loan_payments')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export interface LoanWithSummary extends Loan {
  total_paid: number
  total_pending: number
  next_payment_date: string | null
  next_payment_amount: number | null
}

export async function getAllLoansWithSummary(): Promise<LoanWithSummary[]> {
  const { data, error } = await supabase.rpc('get_loans_with_summary')

  if (error) throw error
  return (data || []).map((row: any) => ({
    ...mapLoan(row),
    total_paid: row.total_paid,
    total_pending: row.total_pending,
    next_payment_date: row.next_payment_date,
    next_payment_amount: row.next_payment_amount,
  }))
}

export async function getLoanPaymentsWithStatus(loanId: string): Promise<LoanPayment[]> {
  return getLoanPayments(loanId)
}

export async function markOverduePayments(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('loan_payments')
    .update({ status: 'overdue' })
    .eq('status', 'pending')
    .lt('date', today)

  if (error) throw error
}

function mapLoan(row: any): Loan {
  return {
    id: row.id,
    type: row.type,
    person: row.person,
    principal: row.principal,
    interest_rate: row.interest_rate,
    term_months: row.term_months,
    start_date: row.start_date,
    status: row.status,
    amortization_type: row.amortization_type,
    description: row.description,
  }
}

function mapLoanPayment(row: any): LoanPayment {
  return {
    id: row.id,
    loan_id: row.loan_id,
    amount: row.amount,
    date: row.date,
    is_interest: Boolean(row.is_interest),
    is_principal: Boolean(row.is_principal),
    status: row.status,
  }
}
