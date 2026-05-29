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
      <View style={styles.container}>
        <Text style={styles.title}>Gastos por categoría</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Sin gastos este mes</Text>
        </View>
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
      <Text style={styles.title}>Gastos por categoría</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          donut
          showGradient
          sectionAutoFocus
          radius={80}
          innerRadius={50}
          innerCircleColor={Colors.background}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerAmount}>{formatCurrency(total)}</Text>
              <Text style={styles.centerLabel}>Total</Text>
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
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  legend: {
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
