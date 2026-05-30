import { PieChart } from 'react-native-gifted-charts'
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
  const chartData = data.slice(0, 6).map((item) => ({
    value: item.amount,
    color: item.category_color,
    text: `${Math.round((item.amount / total) * 100)}%`,
  }))

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          donut
          showGradient
          sectionAutoFocus
          radius={70}
          innerRadius={45}
          innerCircleColor={Colors.card}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerAmount}>{formatCurrency(total)}</Text>
              <Text style={styles.centerText}>Total</Text>
            </View>
          )}
        />
      </View>
      <View style={styles.legend}>
        {data.slice(0, 6).map((item) => (
          <View key={item.category_id} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.category_color }]} />
            <Text style={styles.legendName} numberOfLines={1}>
              {item.category_name}
            </Text>
            <Text style={styles.legendAmount}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chartContainer: {
    alignItems: 'center',
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerAmount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  centerText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  legend: {
    gap: Spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
})