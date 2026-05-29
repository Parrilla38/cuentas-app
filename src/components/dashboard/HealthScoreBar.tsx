import { StyleSheet, Text, View } from 'react-native'

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { getScoreColor, getScoreLabel } from '@/services/health-score'

interface HealthScoreBarProps {
  score: number
}

export function HealthScoreBar({ score }: HealthScoreBarProps) {
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Salud financiera</Text>
        <Text style={[styles.score, { color }]}>{score}</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
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
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  score: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  barBackground: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },
})
