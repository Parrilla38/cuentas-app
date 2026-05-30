import { StyleSheet, Text, View } from 'react-native'

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency } from '@/utils/format'

interface HeroCardProps {
  income: number
  expense: number
  savings: number
}

export function HeroCard({ income, expense, savings }: HeroCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mainSection}>
        <Text style={styles.label}>Ahorro del mes</Text>
        <Text style={[styles.amount, savings < 0 && styles.negative]}>
          {formatCurrency(savings)}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.statCard}>
          <View style={[styles.dot, styles.incomeDot]} />
          <Text style={styles.statLabel}>Ingresos</Text>
          <Text style={styles.statAmount}>{formatCurrency(income)}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.dot, styles.expenseDot]} />
          <Text style={styles.statLabel}>Gastos</Text>
          <Text style={styles.statAmount}>{formatCurrency(expense)}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mainSection: {
    backgroundColor: '#06B6D4',
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },
  amount: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  negative: {
    color: 'rgba(255,255,255,0.9)',
  },
  row: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: '#F5F5F5',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  incomeDot: {
    backgroundColor: '#22C55E',
  },
  expenseDot: {
    backgroundColor: '#EF4444',
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: '#71717A',
  },
  statAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: '#18181B',
    marginLeft: 'auto',
  },
})