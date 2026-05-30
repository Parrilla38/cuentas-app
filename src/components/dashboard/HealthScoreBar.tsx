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
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: '#18181B',
  },
  score: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  barBackground: {
    height: 8,
    backgroundColor: '#E4E4E7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xs,
  },
})