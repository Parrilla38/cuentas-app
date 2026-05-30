import { StyleSheet, Text, View } from 'react-native'

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency } from '@/utils/format'
import type { CategorySpending } from '@/database/queries'

interface ExpenseDonutChartProps {
  data: CategorySpending[]
}

export function ExpenseDonutChart({ data }: ExpenseDonutChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sin gastos este mes</Text>
      </View>
    )
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <View style={styles.container}>
      {data.slice(0, 6).map((item) => {
        const percentage = Math.round((item.amount / total) * 100)
        return (
          <View key={item.category_id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.category_color }]} />
            <Text style={styles.legendName} numberOfLines={1}>
              {item.category_name}
            </Text>
            <Text style={styles.legendAmount}>{formatCurrency(item.amount)}</Text>
            <Text style={styles.legendPercent}>{percentage}%</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendName: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  legendAmount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  legendPercent: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    width: 40,
    textAlign: 'right',
  },
})