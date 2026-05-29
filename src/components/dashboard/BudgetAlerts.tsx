import { StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { BorderRadius, BudgetColors, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency } from '@/utils/format'
import type { BudgetWithSpending } from '@/database/queries'

interface BudgetAlertsProps {
  budgets: BudgetWithSpending[]
}

export function BudgetAlerts({ budgets }: BudgetAlertsProps) {
  const alerts = budgets
    .filter((b) => b.percentage >= 70)
    .sort((a, b) => b.percentage - a.percentage)

  if (alerts.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="exclamationmark.triangle.fill" size={20} color={Colors.warning} />
        <Text style={styles.title}>Alertas de presupuesto</Text>
      </View>
      <View style={styles.list}>
        {alerts.slice(0, 3).map((budget) => {
          const isOver = budget.percentage >= 100
          const isDanger = budget.percentage >= 90 && !isOver
          const color = isOver ? BudgetColors.danger : isDanger ? BudgetColors.danger : BudgetColors.warning
          const statusText = isOver ? 'Excedido' : isDanger ? 'Casi al límite' : 'Atención'

          return (
            <View key={budget.id} style={styles.alert}>
              <View style={[styles.iconContainer, { backgroundColor: budget.category_color + '20' }]}>
                <Icon
                  name={budget.category_icon}
                  size={18}
                  color={budget.category_color}
                />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{budget.category_name}</Text>
                <Text style={[styles.status, { color }]}>
                  {statusText}
                </Text>
              </View>
              <View style={styles.amounts}>
                <Text style={styles.spent}>{formatCurrency(budget.spent)}</Text>
                <Text style={styles.total}>de {formatCurrency(budget.amount)}</Text>
              </View>
            </View>
          )
        })}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  list: {
    gap: Spacing.md,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  status: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  amounts: {
    alignItems: 'flex-end',
  },
  spent: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  total: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
})
