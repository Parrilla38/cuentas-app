import { useRouter } from 'expo-router'
import { useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Icon } from '@/components/ui/Icon'
import { Card } from '@/components/ui/Card'
import { Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency } from '@/utils/format'
import { useSavingsStore } from '@/stores/savings'

export default function SavingsScreen() {
  const router = useRouter()
  const { isLoading, goals, loadData } = useSavingsStore()

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = useCallback(() => {
    loadData()
  }, [loadData])

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0)

  if (isLoading && goals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accentCyan} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Colors.accentCyan} />
        }
      >
        <Text style={styles.title}>Metas de ahorro</Text>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total ahorrado</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalSaved)}</Text>
          {totalTarget > 0 && (
            <Text style={styles.summarySubtext}>
              de {formatCurrency(totalTarget)} objetivo
            </Text>
          )}
        </Card>

        {goals.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="target" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Sin metas de ahorro</Text>
            <Text style={styles.emptyText}>
              Crea tu primera meta para empezar a ahorrar con un objetivo
            </Text>
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)} style={styles.list}>
            {goals.map((goal) => {
              const progress = goal.target_amount > 0 ? goal.current_amount / goal.target_amount : 0
              const progressWidth = Math.min(progress * 100, 100)
              const isCompleted = progress >= 1

              return (
                <Pressable
                  key={goal.id}
                  onPress={() => router.push(`/savings/${goal.id}` as any)}
                >
                  <Card style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                        <Icon name={goal.icon} size={24} color={goal.color} />
                      </View>
                      <View style={styles.goalInfo}>
                        <Text style={styles.goalName}>{goal.name}</Text>
                        <Text style={styles.goalAmounts}>
                          {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                        </Text>
                      </View>
                      <Text style={[styles.goalPercent, { color: isCompleted ? Colors.savings : goal.color }]}>
                        {(progress * 100).toFixed(0)}%
                      </Text>
                    </View>

                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progressWidth}%`,
                            backgroundColor: isCompleted ? Colors.savings : goal.color,
                          },
                        ]}
                      />
                    </View>

                    {goal.deadline && !isCompleted && (
                      <Text style={styles.goalDeadline}>
                        Objetivo: {new Date(goal.deadline).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    )}
                    {isCompleted && (
                      <Text style={styles.completedText}>Meta completada</Text>
                    )}
                  </Card>
                </Pressable>
              )
            })}
          </Animated.View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/savings/add' as any)}
        style={styles.fab}
      >
        <Icon name="plus" size={28} color="#fff" />
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  summaryCard: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  summaryAmount: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.savings,
  },
  summarySubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    gap: Spacing.md,
  },
  goalCard: {
    gap: Spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    gap: 2,
  },
  goalName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  goalAmounts: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  goalPercent: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalDeadline: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  completedText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.savings,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.accentCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
})
