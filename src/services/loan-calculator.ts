import type { AmortizationType } from '@/types'

export interface AmortizationRow {
  month: number
  date: string
  payment: number
  principal: number
  interest: number
  remainingBalance: number
}

export interface LoanCalculationResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  schedule: AmortizationRow[]
}

export function calculateLoan(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: string,
  type: AmortizationType,
): LoanCalculationResult {
  if (type === 'french') {
    return calculateFrench(principal, annualRate, termMonths, startDate)
  }
  return calculateGerman(principal, annualRate, termMonths, startDate)
}

function calculateFrench(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: string,
): LoanCalculationResult {
  const monthlyRate = annualRate / 100 / 12
  let monthlyPayment: number

  if (monthlyRate === 0) {
    monthlyPayment = principal / termMonths
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
  }

  const schedule: AmortizationRow[] = []
  let remaining = principal
  let totalInterest = 0

  for (let i = 1; i <= termMonths; i++) {
    const interest = remaining * monthlyRate
    const principalPart = monthlyPayment - interest
    remaining = Math.max(0, remaining - principalPart)
    totalInterest += interest

    schedule.push({
      month: i,
      date: addMonths(startDate, i),
      payment: round(monthlyPayment),
      principal: round(principalPart),
      interest: round(interest),
      remainingBalance: round(remaining),
    })
  }

  return {
    monthlyPayment: round(monthlyPayment),
    totalPayment: round(monthlyPayment * termMonths),
    totalInterest: round(totalInterest),
    schedule,
  }
}

function calculateGerman(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: string,
): LoanCalculationResult {
  const monthlyRate = annualRate / 100 / 12
  const principalPart = principal / termMonths

  const schedule: AmortizationRow[] = []
  let remaining = principal
  let totalInterest = 0
  let totalPayment = 0

  for (let i = 1; i <= termMonths; i++) {
    const interest = remaining * monthlyRate
    const payment = principalPart + interest
    remaining = Math.max(0, remaining - principalPart)
    totalInterest += interest
    totalPayment += payment

    schedule.push({
      month: i,
      date: addMonths(startDate, i),
      payment: round(payment),
      principal: round(principalPart),
      interest: round(interest),
      remainingBalance: round(remaining),
    })
  }

  return {
    monthlyPayment: round(schedule[0]?.payment ?? 0),
    totalPayment: round(totalPayment),
    totalInterest: round(totalInterest),
    schedule,
  }
}

export function calculateCompoundInterest(
  initialCapital: number,
  monthlyContribution: number,
  annualRate: number,
  years: number,
): { finalAmount: number; totalContributions: number; totalInterest: number; yearlyBreakdown: { year: number; balance: number; contributions: number; interest: number }[] } {
  const monthlyRate = annualRate / 100 / 12
  let balance = initialCapital
  let totalContributions = initialCapital
  const yearlyBreakdown: { year: number; balance: number; contributions: number; interest: number }[] = []

  for (let year = 1; year <= years; year++) {
    const startBalance = balance
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution
      totalContributions += monthlyContribution
    }
    yearlyBreakdown.push({
      year,
      balance: round(balance),
      contributions: round(totalContributions),
      interest: round(balance - startBalance - monthlyContribution * 12),
    })
  }

  return {
    finalAmount: round(balance),
    totalContributions: round(totalContributions),
    totalInterest: round(balance - totalContributions),
    yearlyBreakdown,
  }
}

function addMonths(dateStr: string, months: number): string {
  const date = new Date(dateStr)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
