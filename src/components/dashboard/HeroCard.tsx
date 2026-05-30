import { StyleSheet, Text, View } from 'react-native'

import { Card, BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency } from '@/utils/format'

interface HeroCardProps {
  income: number
  expense: number
  savings: number
}

export function HeroCard({ income, expense, savings }: HeroCardProps) {
  return (
    <Card style={styles.container}>
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
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'hidden',
  },
  mainSection: {
    backgroundColor: Colors.accentCyan,
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
    backgroundColor: Colors.success,
  },
  expenseDot: {
    backgroundColor: Colors.danger,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  statAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginLeft: 'auto',
  },
})