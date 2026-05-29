import { Share, Platform } from 'react-native'

import { supabase } from '@/lib/supabase'
import {
  getAllCategories,
  getAllTransactions,
  getAllLoans,
  getLoanPayments,
  getAllSavingsGoals,
  getContributionsByGoal,
  getAllRecurringExpenses,
  getBudgetsByMonth,
  getAllSettings,
} from '@/database/queries'

interface BackupData {
  version: number
  exported_at: string
  categories: Awaited<ReturnType<typeof getAllCategories>>
  transactions: Awaited<ReturnType<typeof getAllTransactions>>
  loans: Awaited<ReturnType<typeof getAllLoans>>
  loan_payments: Record<string, Awaited<ReturnType<typeof getLoanPayments>>>
  savings_goals: Awaited<ReturnType<typeof getAllSavingsGoals>>
  contributions: Record<string, Awaited<ReturnType<typeof getContributionsByGoal>>>
  recurring_expenses: Awaited<ReturnType<typeof getAllRecurringExpenses>>
  budgets: Awaited<ReturnType<typeof getBudgetsByMonth>>
  settings: Awaited<ReturnType<typeof getAllSettings>>
}

function simpleEncrypt(text: string, password: string): string {
  const encoded = btoa(unescape(encodeURIComponent(text)))
  let result = ''
  for (let i = 0; i < encoded.length; i++) {
    const charCode = encoded.charCodeAt(i) ^ password.charCodeAt(i % password.length)
    result += String.fromCharCode(charCode)
  }
  return btoa(result)
}

function simpleDecrypt(encrypted: string, password: string): string {
  const decoded = atob(encrypted)
  let result = ''
  for (let i = 0; i < decoded.length; i++) {
    const charCode = decoded.charCodeAt(i) ^ password.charCodeAt(i % password.length)
    result += String.fromCharCode(charCode)
  }
  return decodeURIComponent(escape(atob(result)))
}

export async function exportBackup(password: string): Promise<string> {
  const now = new Date()
  const [
    categories,
    transactions,
    loans,
    savings_goals,
    recurring_expenses,
    settings,
    budgets,
  ] = await Promise.all([
    getAllCategories(),
    getAllTransactions(),
    getAllLoans(),
    getAllSavingsGoals(),
    getAllRecurringExpenses(),
    getAllSettings(),
    getBudgetsByMonth(now.getFullYear(), now.getMonth() + 1),
  ])

  const loan_payments: Record<string, Awaited<ReturnType<typeof getLoanPayments>>> = {}
  for (const loan of loans) {
    loan_payments[loan.id] = await getLoanPayments(loan.id)
  }

  const contributions: Record<string, Awaited<ReturnType<typeof getContributionsByGoal>>> = {}
  for (const goal of savings_goals) {
    contributions[goal.id] = await getContributionsByGoal(goal.id)
  }

  const data: BackupData = {
    version: 1,
    exported_at: new Date().toISOString(),
    categories,
    transactions,
    loans,
    loan_payments,
    savings_goals,
    contributions,
    recurring_expenses,
    budgets,
    settings,
  }

  const json = JSON.stringify(data)

  if (password) {
    return simpleEncrypt(json, password)
  }
  return json
}

export async function shareBackup(password: string): Promise<void> {
  const data = await exportBackup(password)
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]

  if (Platform.OS === 'web') {
    if (navigator.share) {
      await navigator.share({
        title: `Cuentas Backup ${dateStr}`,
        text: data,
      })
    } else {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cuentas-backup-${dateStr}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  } else {
    await Share.share({
      message: data,
      title: `Cuentas Backup ${dateStr}`,
    })
  }
}

export async function importBackup(encryptedData: string, password: string): Promise<BackupData> {
  let json: string
  if (password) {
    json = simpleDecrypt(encryptedData, password)
  } else {
    json = encryptedData
  }

  const data: BackupData = JSON.parse(json)

  if (!data.version || !data.categories || !data.transactions) {
    throw new Error('Formato de backup inválido')
  }

  return data
}

export async function restoreFromBackup(data: BackupData): Promise<void> {
  await supabase.from('contributions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('loan_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('budgets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('recurring_expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('savings_goals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('loans').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  for (const cat of data.categories) {
    await supabase.from('categories').insert({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      is_fixed: cat.is_fixed,
      sort_order: cat.sort_order,
    })
  }

  for (const t of data.transactions) {
    await supabase.from('transactions').insert({
      id: t.id,
      type: t.type,
      amount: t.amount,
      date: t.date,
      category_id: t.category_id,
      description: t.description,
      loan_id: t.loan_id,
      tag: t.tag,
      recurring_id: t.recurring_id,
      created_at: t.created_at,
    })
  }

  for (const loan of data.loans) {
    await supabase.from('loans').insert({
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
  }

  for (const [loanId, payments] of Object.entries(data.loan_payments)) {
    for (const p of payments) {
      await supabase.from('loan_payments').insert({
        id: p.id,
        loan_id: loanId,
        amount: p.amount,
        date: p.date,
        is_interest: p.is_interest,
        is_principal: p.is_principal,
        status: p.status,
      })
    }
  }

  for (const goal of data.savings_goals) {
    await supabase.from('savings_goals').insert({
      id: goal.id,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline,
      color: goal.color,
      icon: goal.icon,
    })
  }

  for (const [goalId, contribs] of Object.entries(data.contributions)) {
    for (const c of contribs) {
      await supabase.from('contributions').insert({
        id: c.id,
        goal_id: goalId,
        amount: c.amount,
        date: c.date,
      })
    }
  }

  for (const re of data.recurring_expenses) {
    await supabase.from('recurring_expenses').insert({
      id: re.id,
      amount: re.amount,
      day_of_month: re.day_of_month,
      category_id: re.category_id,
      description: re.description,
      active: re.active,
    })
  }

  for (const b of data.budgets) {
    await supabase.from('budgets').insert({
      id: b.id,
      category_id: b.category_id,
      month: b.month,
      year: b.year,
      amount: b.amount,
    })
  }
}
