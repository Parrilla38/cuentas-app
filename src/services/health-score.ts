import type { BudgetWithSpending, MonthSummary } from '@/database/queries'
import type { SavingsGoal } from '@/types'

interface HealthScoreInput {
  monthSummary: MonthSummary
  budgets: BudgetWithSpending[]
  activeGoal: SavingsGoal | null
  monthlySalary: number
}

interface HealthScoreResult {
  score: number
  breakdown: {
    savingsRatio: number
    budgetHealth: number
    emergencyFund: number
    spendingControl: number
  }
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  const { monthSummary, budgets, activeGoal, monthlySalary } = input

  const savingsRatio = calculateSavingsRatio(monthSummary)
  const budgetHealth = calculateBudgetHealth(budgets)
  const emergencyFund = calculateEmergencyFund(monthSummary, activeGoal)
  const spendingControl = calculateSpendingControl(monthSummary, monthlySalary)

  const score = Math.round(
    savingsRatio * 0.3 +
    budgetHealth * 0.25 +
    emergencyFund * 0.25 +
    spendingControl * 0.2,
  )

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: {
      savingsRatio,
      budgetHealth,
      emergencyFund,
      spendingControl,
    },
  }
}

function calculateSavingsRatio(summary: MonthSummary): number {
  if (summary.income === 0) return 0
  const ratio = (summary.savings / summary.income) * 100
  if (ratio >= 30) return 100
  if (ratio >= 20) return 80
  if (ratio >= 10) return 60
  if (ratio >= 0) return 40
  return 10
}

function calculateBudgetHealth(budgets: BudgetWithSpending[]): number {
  if (budgets.length === 0) return 70

  let totalScore = 0
  for (const budget of budgets) {
    if (budget.percentage <= 70) {
      totalScore += 100
    } else if (budget.percentage <= 90) {
      totalScore += 70
    } else if (budget.percentage <= 100) {
      totalScore += 40
    } else {
      totalScore += 10
    }
  }

  return totalScore / budgets.length
}

function calculateEmergencyFund(
  summary: MonthSummary,
  activeGoal: SavingsGoal | null,
): number {
  if (!activeGoal) return 30

  const monthsCovered = summary.expense > 0
    ? activeGoal.current_amount / summary.expense
    : 0

  if (monthsCovered >= 6) return 100
  if (monthsCovered >= 3) return 80
  if (monthsCovered >= 1) return 50
  return 20
}

function calculateSpendingControl(summary: MonthSummary, monthlySalary: number): number {
  if (monthlySalary === 0) return 50

  const spendingRatio = (summary.expense / monthlySalary) * 100

  if (spendingRatio <= 50) return 100
  if (spendingRatio <= 70) return 80
  if (spendingRatio <= 80) return 60
  if (spendingRatio <= 90) return 40
  if (spendingRatio <= 100) return 20
  return 0
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente'
  if (score >= 60) return 'Buena'
  if (score >= 40) return 'Regular'
  return 'Necesita mejora'
}
