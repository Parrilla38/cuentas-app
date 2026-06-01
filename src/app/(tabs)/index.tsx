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
import { Card } from '@/components/ui/Card'
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
          <ActivityIndicator size="large" color="#22D3EE" />
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
            tintColor="#22D3EE"
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
            <Text style={styles.settingsIcon}>⚙</Text>
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
    backgroundColor: '#0F172A',
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
    padding: 24,
    gap: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingsIcon: {
    fontSize: 20,
    color: '#94A3B8',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  month: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
})