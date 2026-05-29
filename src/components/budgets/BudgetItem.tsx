import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { BorderRadius, BudgetColors, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency, formatPercentage } from '@/utils/format'
import type { BudgetWithSpending } from '@/database/queries'

interface BudgetItemProps {
  budget: BudgetWithSpending
  onPress?: () => void
}

export function BudgetItem({ budget, onPress }: BudgetItemProps) {
  const percentage = Math.min(budget.percentage, 100)
  const isOver = budget.percentage >= 100

  let barColor: string = BudgetColors.safe
  if (budget.percentage >= 90) barColor = BudgetColors.danger
  else if (budget.percentage >= 70) barColor = BudgetColors.warning

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: budget.category_color + '20' }]}>
          <Icon name={budget.category_icon} size={20} color={budget.category_color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {budget.category_name}
          </Text>
          <Text style={[styles.percentage, { color: barColor }]}>
            {formatPercentage(budget.percentage)}
          </Text>
        </View>
        <View style={styles.amounts}>
          <Text style={[styles.spent, isOver && { color: BudgetColors.danger }]}>
            {formatCurrency(budget.spent)}
          </Text>
          <Text style={styles.total}>de {formatCurrency(budget.amount)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.remaining}>
          {isOver ? 'Excedido' : 'Disponible'}:{' '}
          <Text style={[styles.remainingAmount, isOver && { color: BudgetColors.danger }]}>
            {formatCurrency(Math.abs(budget.amount - budget.spent))}
          </Text>
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  percentage: {
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
  progressContainer: {
    marginBottom: Spacing.xs,
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  remaining: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  remainingAmount: {
    color: Colors.savings,
    fontWeight: FontWeight.semibold,
  },
  pressed: {
    opacity: 0.8,
  },
})
