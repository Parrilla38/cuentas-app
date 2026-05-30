import { useCallback, useEffect } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import {
  BudgetAlerts,
  ExpenseDonutChart,
  FloatingActionButton,
  HealthScoreBar,
  HeroCard,
  SavingsProgress,
  UpcomingPayments,
} from '@/components/dashboard'
import { Card, Colors, FontSize, FontWeight, Spacing, Shadow } from '@/constants'
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
            <Text style={styles.greeting}>Hola 👋</Text>
            <Text style={styles.month}>
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/settings' as any)} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <HeroCard
          income={monthSummary.income}
          expense={monthSummary.expense}
          savings={monthSummary.savings}
        />

        <HealthScoreBar score={healthScore.score} />

        <Card>
          <Text style={styles.sectionTitle}>Gastos por categoría</Text>
          <ExpenseDonutChart data={categorySpending} />
        </Card>

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
    marginBottom: Spacing.md,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.small,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  month: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
})