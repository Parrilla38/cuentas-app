export type TransactionType = 'income' | 'expense'

export type LoanType = 'given' | 'received'

export type LoanStatus = 'active' | 'paid' | 'overdue'

export type AmortizationType = 'french' | 'german'

export type PaymentStatus = 'pending' | 'paid' | 'overdue'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  date: string
  category_id: string
  description: string
  loan_id: string | null
  tag: string | null
  recurring_id: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TransactionType
  is_fixed: boolean
  sort_order: number
}

export interface Loan {
  id: string
  type: LoanType
  person: string
  principal: number
  interest_rate: number
  term_months: number
  start_date: string
  status: LoanStatus
  amortization_type: AmortizationType
  description: string
}

export interface LoanPayment {
  id: string
  loan_id: string
  amount: number
  date: string
  is_interest: boolean
  is_principal: boolean
  status: PaymentStatus
}

export interface Budget {
  id: string
  category_id: string
  month: number
  year: number
  amount: number
}

export interface SavingsGoal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  color: string
  icon: string
}

export interface Contribution {
  id: string
  goal_id: string
  amount: number
  date: string
}

export interface RecurringExpense {
  id: string
  amount: number
  day_of_month: number
  category_id: string
  description: string
  active: boolean
}

export interface Setting {
  key: string
  value: string
}
