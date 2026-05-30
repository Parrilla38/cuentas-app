import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency } from '@/utils/format'
import type { SavingsGoal } from '@/types'

interface SavingsProgressProps {
  goal: SavingsGoal
}

export function SavingsProgress({ goal }: SavingsProgressProps) {
  const percentage = Math.min(100, (goal.current_amount / goal.target_amount) * 100)
  const remaining = goal.target_amount - goal.current_amount

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconRow}>
          <View style={[styles.iconContainer, { backgroundColor: goal.color + '20' }]}>
            <Icon
              name={goal.icon}
              size={22}
              color={goal.color}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{goal.name}</Text>
            <Text style={styles.subtitle}>Meta de ahorro</Text>
          </View>
        </View>
        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
      </View>

      <View style={styles.barBackground}>
        <LinearGradient
          colors={[goal.color, goal.color + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.barFill, { width: `${percentage}%` }]}
        />
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Ahorrado</Text>
          <Text style={styles.footerValue}>{formatCurrency(goal.current_amount)}</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.footerLabel}>Faltan</Text>
          <Text style={styles.footerValue}>{formatCurrency(remaining)}</Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  percentage: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.accentCyan,
  },
  barBackground: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
})
