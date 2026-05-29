import type { BudgetWithSpending } from '@/database/queries'
import { BudgetColors } from '@/constants'

export type AlertLevel = 'safe' | 'warning' | 'danger' | 'exceeded'

export interface BudgetAlert {
  budget: BudgetWithSpending
  level: AlertLevel
  message: string
  color: string
}

export function analyzeBudget(budget: BudgetWithSpending): BudgetAlert | null {
  const pct = budget.percentage

  if (pct >= 100) {
    return {
      budget,
      level: 'exceeded',
      message: `Has excedido tu presupuesto en ${budget.category_name}`,
      color: BudgetColors.danger,
    }
  }

  if (pct >= 90) {
    return {
      budget,
      level: 'danger',
      message: `Te acercas al límite de tu presupuesto en ${budget.category_name}`,
      color: BudgetColors.danger,
    }
  }

  if (pct >= 70) {
    return {
      budget,
      level: 'warning',
      message: `Ya has gastado el ${Math.round(pct)}% de tu presupuesto en ${budget.category_name}`,
      color: BudgetColors.warning,
    }
  }

  return null
}

export function analyzeAllBudgets(budgets: BudgetWithSpending[]): BudgetAlert[] {
  return budgets
    .map(analyzeBudget)
    .filter((alert): alert is BudgetAlert => alert !== null)
    .sort((a, b) => b.budget.percentage - a.budget.percentage)
}

export interface BudgetSummary {
  totalBudgeted: number
  totalSpent: number
  remaining: number
  percentage: number
}

export function calculateBudgetSummary(budgets: BudgetWithSpending[]): BudgetSummary {
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const remaining = totalBudgeted - totalSpent
  const percentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0

  return { totalBudgeted, totalSpent, remaining, percentage }
}

export function applyTemplate503020(
  salary: number,
  fixedCategoryIds: string[],
  variableCategoryIds: string[],
): Map<string, number> {
  const needs = salary * 0.5
  const wants = salary * 0.3

  const result = new Map<string, number>()

  if (fixedCategoryIds.length > 0) {
    const perFixed = needs / fixedCategoryIds.length
    for (const id of fixedCategoryIds) {
      result.set(id, Math.round(perFixed * 100) / 100)
    }
  }

  if (variableCategoryIds.length > 0) {
    const perVariable = wants / variableCategoryIds.length
    for (const id of variableCategoryIds) {
      result.set(id, Math.round(perVariable * 100) / 100)
    }
  }

  return result
}
