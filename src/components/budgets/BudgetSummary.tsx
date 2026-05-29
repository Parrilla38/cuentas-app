import { StyleSheet, Text, View } from 'react-native'

import { BorderRadius, BudgetColors, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency } from '@/utils/format'
import type { BudgetSummary as BudgetSummaryType } from '@/services/budget-analyzer'

interface BudgetSummaryProps {
  summary: BudgetSummaryType
  salary: number
}

export function BudgetSummary({ summary, salary }: BudgetSummaryProps) {
  const unassigned = salary - summary.totalBudgeted

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.label}>Presupuestado</Text>
          <Text style={styles.value}>{formatCurrency(summary.totalBudgeted)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>Gastado</Text>
          <Text style={[styles.value, { color: Colors.danger }]}>
            {formatCurrency(summary.totalSpent)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>Disponible</Text>
          <Text style={[styles.value, { color: summary.remaining >= 0 ? Colors.savings : BudgetColors.danger }]}>
            {formatCurrency(summary.remaining)}
          </Text>
        </View>
      </View>

      {unassigned > 0 && (
        <View style={styles.unassigned}>
          <Text style={styles.unassignedLabel}>Sin asignar</Text>
          <Text style={styles.unassignedAmount}>{formatCurrency(unassigned)}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  unassigned: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  unassignedLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  unassignedAmount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.accentCyan,
  },
})
