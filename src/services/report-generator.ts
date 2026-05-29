import { supabase } from '@/lib/supabase'
import type { MonthSummary, CategorySpending } from '@/database/queries'
import { getMonthSummary, getSpendingByCategory } from '@/database/queries'

export interface MonthlyTrend {
  month: number
  year: number
  label: string
  income: number
  expense: number
  savings: number
}

export interface CategoryComparison {
  category_name: string
  category_icon: string
  category_color: string
  currentMonth: number
  previousMonth: number
  change: number
  changePercent: number
}

export interface ReportData {
  trend: MonthlyTrend[]
  topCategories: CategorySpending[]
  categoryComparison: CategoryComparison[]
  currentSummary: MonthSummary
  previousSummary: MonthSummary
  netWorth: number
}

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export async function generateMonthlyReport(year: number, month: number): Promise<ReportData> {
  const trend: MonthlyTrend[] = []

  for (let i = 5; i >= 0; i--) {
    let m = month - i
    let y = year
    while (m <= 0) {
      m += 12
      y -= 1
    }
    const summary = await getMonthSummary(y, m)
    trend.push({
      month: m,
      year: y,
      label: MONTH_LABELS[m - 1],
      income: summary.income,
      expense: summary.expense,
      savings: summary.savings,
    })
  }

  const currentSummary = await getMonthSummary(year, month)
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const previousSummary = await getMonthSummary(prevYear, prevMonth)

  const topCategories = await getSpendingByCategory(year, month)
  const prevCategories = await getSpendingByCategory(prevYear, prevMonth)

  const categoryComparison: CategoryComparison[] = topCategories.slice(0, 5).map((cat) => {
    const prev = prevCategories.find((p) => p.category_id === cat.category_id)
    const prevAmount = prev?.amount ?? 0
    const change = cat.amount - prevAmount
    const changePercent = prevAmount > 0 ? (change / prevAmount) * 100 : 0
    return {
      category_name: cat.category_name,
      category_icon: cat.category_icon,
      category_color: cat.category_color,
      currentMonth: cat.amount,
      previousMonth: prevAmount,
      change,
      changePercent,
    }
  })

  const { data, error } = await supabase.rpc('get_net_worth')

  if (error) throw error

  const netWorthData = data?.[0] || { total_income: 0, total_expense: 0 }
  const netWorth = netWorthData.total_income - netWorthData.total_expense

  return {
    trend,
    topCategories: topCategories.slice(0, 5),
    categoryComparison,
    currentSummary,
    previousSummary,
    netWorth,
  }
}

export function generateCSV(data: ReportData): string {
  const lines: string[] = []

  lines.push('TENDENCIA MENSUAL')
  lines.push('Mes,Ingresos,Gastos,Ahorro')
  for (const t of data.trend) {
    lines.push(`${t.label} ${t.year},${t.income.toFixed(2)},${t.expense.toFixed(2)},${t.savings.toFixed(2)}`)
  }

  lines.push('')
  lines.push('TOP CATEGORÍAS DE GASTO')
  lines.push('Categoría,Cantidad')
  for (const c of data.topCategories) {
    lines.push(`${c.category_name},${c.amount.toFixed(2)}`)
  }

  lines.push('')
  lines.push('COMPARATIVA MENSUAL')
  lines.push('Categoría,Mes actual,Mes anterior,Cambio,Cambio %')
  for (const c of data.categoryComparison) {
    lines.push(`${c.category_name},${c.currentMonth.toFixed(2)},${c.previousMonth.toFixed(2)},${c.change.toFixed(2)},${c.changePercent.toFixed(1)}%`)
  }

  lines.push('')
  lines.push(`Patrimonio neto,${data.netWorth.toFixed(2)}`)

  return lines.join('\n')
}
