import { StyleSheet, Text, View } from 'react-native'

import { Card, BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { getScoreColor, getScoreLabel } from '@/services/health-score'

interface HealthScoreBarProps {
  score: number
}

export function HealthScoreBar({ score }: HealthScoreBarProps) {
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconDot, { backgroundColor: color }]} />
          <Text style={styles.title}>Salud financiera</Text>
        </View>
        <Text style={[styles.score, { color }]}>{score}</Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  score: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  barBackground: {
    height: 8,
    backgroundColor: Colors.border,
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
    marginTop: Spacing.sm,
  },
})