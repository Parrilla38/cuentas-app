import { useCallback, useEffect } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import {
  BudgetAlerts,
  ExpenseDonutChart,
  FloatingActionButton,
  HealthScoreBar,
  HeroCard,
  SavingsProgress,
  UpcomingPayments,
} from '@/components/dashboard'
import { Icon } from '@/components/ui/Icon'
import { Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { calculateHealthScore } from '@/services/health-score'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function DashboardScreen() {
  const router = useRouter()
  const {
    isLoading,
    monthSummary,
    categorySpending,
    budgets,
    activeGoal,
    upcomingPayments,
    currentMonth,
    currentYear,
    loadDashboard,
  } = useDashboardStore()

  const monthlySalary = useAuthStore((s) => s.monthlySalary)

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const onRefresh = useCallback(() => {
    loadDashboard()
  }, [loadDashboard])

  const healthScore = calculateHealthScore({
    monthSummary,
    budgets,
    activeGoal,
    monthlySalary,
  })

  if (isLoading && monthSummary.income === 0 && monthSummary.expense === 0) {
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
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={Colors.accentCyan}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola</Text>
            <Text style={styles.month}>
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/settings' as any)} style={styles.settingsButton}>
            <Icon name="ellipsis.circle.fill" size={24} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <HeroCard
          income={monthSummary.income}
          expense={monthSummary.expense}
          savings={monthSummary.savings}
        />

        <HealthScoreBar score={healthScore.score} />

        <ExpenseDonutChart data={categorySpending} />

        <BudgetAlerts budgets={budgets} />

        {activeGoal && <SavingsProgress goal={activeGoal} />}

        <UpcomingPayments payments={upcomingPayments} />
      </ScrollView>

      <FloatingActionButton />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  month: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
})
