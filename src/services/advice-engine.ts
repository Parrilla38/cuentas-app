import type { BudgetWithSpending, CategorySpending, MonthSummary } from '@/database/queries'
import type { SavingsGoal } from '@/types'
import { formatCurrency, formatPercentage } from '@/utils/format'

export interface Advice {
  id: string
  type: 'info' | 'warning' | 'success' | 'danger'
  title: string
  message: string
}

interface AdviceContext {
  monthSummary: MonthSummary
  budgets: BudgetWithSpending[]
  categorySpending: CategorySpending[]
  activeGoal: SavingsGoal | null
  monthlySalary: number
  previousMonthSummary?: MonthSummary
  previousCategorySpending?: CategorySpending[]
}

export function generateAdvice(ctx: AdviceContext): Advice[] {
  const advice: Advice[] = []
  const { monthSummary, budgets, categorySpending, activeGoal, monthlySalary } = ctx

  if (monthSummary.income > 0) {
    const savingsRatio = (monthSummary.savings / monthSummary.income) * 100
    if (savingsRatio < 20) {
      advice.push({
        id: 'low-savings',
        type: 'warning',
        title: 'Ratio de ahorro bajo',
        message: `Tu ratio de ahorro es del ${formatPercentage(savingsRatio)}. Intenta ahorrar al menos el 20% de tus ingresos.`,
      })
    } else if (savingsRatio >= 20) {
      advice.push({
        id: 'good-savings',
        type: 'success',
        title: 'Buen ratio de ahorro',
        message: `Estás ahorrando el ${formatPercentage(savingsRatio)} de tus ingresos. ¡Sigue así!`,
      })
    }
  }

  if (ctx.previousCategorySpending && ctx.previousCategorySpending.length > 0) {
    for (const cat of categorySpending) {
      const prev = ctx.previousCategorySpending.find((p) => p.category_id === cat.category_id)
      if (prev && prev.amount > 0) {
        const change = ((cat.amount - prev.amount) / prev.amount) * 100
        if (change > 30) {
          advice.push({
            id: `category-up-${cat.category_id}`,
            type: 'warning',
            title: 'Gasto en aumento',
            message: `Tu gasto en ${cat.category_name} subió un ${formatPercentage(change)} este mes (${formatCurrency(cat.amount)} vs ${formatCurrency(prev.amount)}).`,
          })
        }
      }
    }
  }

  if (monthlySalary > 0) {
    const subscriptions = categorySpending.find(
      (c) => c.category_name.toLowerCase().includes('suscripcion') || c.category_name.toLowerCase().includes('streaming'),
    )
    if (subscriptions && (subscriptions.amount / monthlySalary) * 100 > 15) {
      advice.push({
        id: 'high-subscriptions',
        type: 'warning',
        title: 'Suscripciones elevadas',
        message: `Tus suscripciones representan el ${formatPercentage((subscriptions.amount / monthlySalary) * 100)} de tus ingresos. Revisa si las usas todas.`,
      })
    }
  }

  if (!activeGoal) {
    advice.push({
      id: 'no-goal',
      type: 'info',
      title: 'Crea una meta de ahorro',
      message: 'No tienes metas de ahorro activas. Crear un fondo de emergencia de 3-6 meses de gastos es un buen comienzo.',
    })
  }

  for (const budget of budgets) {
    if (budget.amount > 0) {
      const ratio = budget.spent / budget.amount
      if (ratio >= 0.9 && ratio < 1) {
        advice.push({
          id: `budget-near-${budget.id}`,
          type: 'warning',
          title: 'Presupuesto al límite',
          message: `Te acercas al límite de tu presupuesto en ${budget.category_name} (${formatPercentage(ratio * 100)} usado).`,
        })
      }
    }
  }

  if (categorySpending.length > 0 && monthlySalary > 0) {
    const topCategory = categorySpending[0]
    if (topCategory) {
      const reduction = topCategory.amount * 0.1
      const yearlySaving = reduction * 12
      if (yearlySaving > 50) {
        advice.push({
          id: 'reduction-opportunity',
          type: 'info',
          title: 'Oportunidad de ahorro',
          message: `Si reduces ${topCategory.category_name} un 10%, ahorrarías ${formatCurrency(yearlySaving)} al año.`,
        })
      }
    }
  }

  if (ctx.previousMonthSummary && ctx.previousMonthSummary.income > 0) {
    const currentSavingsRate = monthSummary.income > 0 ? (monthSummary.savings / monthSummary.income) * 100 : 0
    const prevSavingsRate = (ctx.previousMonthSummary.savings / ctx.previousMonthSummary.income) * 100
    if (currentSavingsRate > 20 && prevSavingsRate > 20) {
      advice.push({
        id: 'consistent-savings',
        type: 'success',
        title: 'Ahorro constante',
        message: '¡Llevas meses seguidos ahorrando más del 20%! Excelente disciplina financiera.',
      })
    }
  }

  return advice.slice(0, 5)
}
