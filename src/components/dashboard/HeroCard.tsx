import { LinearGradient } from 'expo-linear-gradient'
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
      <LinearGradient
        colors={[Colors.income.start, Colors.income.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>Ahorro del mes</Text>
        <Text style={[styles.amount, savings < 0 && styles.negative]}>
          {formatCurrency(savings)}
        </Text>
      </LinearGradient>

      <View style={styles.row}>
        <View style={styles.statCard}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <Text style={styles.statLabel}>Ingresos</Text>
          <Text style={styles.statAmount}>{formatCurrency(income)}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.statLabel}>Gastos</Text>
          <Text style={styles.statAmount}>{formatCurrency(expense)}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  gradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
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
    color: Colors.textPrimary,
  },
  negative: {
    color: '#FCA5A5',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
})
