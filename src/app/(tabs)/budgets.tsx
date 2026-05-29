import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BudgetItem, BudgetSummary, RecurringExpenseItem } from '@/components/budgets'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { calculateBudgetSummary } from '@/services/budget-analyzer'
import { useBudgetsStore } from '@/stores/budgets'
import { useAuthStore } from '@/stores/auth'
import { updateRecurringExpense } from '@/database/queries'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

type Tab = 'budgets' | 'recurring'

export default function BudgetsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('budgets')
  const router = useRouter()

  const {
    isLoading,
    budgets,
    recurringExpenses,
    currentMonth,
    currentYear,
    loadData,
    setMonth,
    applyTemplate,
    removeBudget,
  } = useBudgetsStore()

  const monthlySalary = useAuthStore((s) => s.monthlySalary)

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = useCallback(() => {
    loadData()
  }, [loadData])

  const summary = calculateBudgetSummary(budgets)

  const handlePreviousMonth = useCallback(() => {
    if (currentMonth === 1) {
      setMonth(currentYear - 1, 12)
    } else {
      setMonth(currentYear, currentMonth - 1)
    }
  }, [currentMonth, currentYear, setMonth])

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 12) {
      setMonth(currentYear + 1, 1)
    } else {
      setMonth(currentYear, currentMonth + 1)
    }
  }, [currentMonth, currentYear, setMonth])

  const handleApplyTemplate = useCallback(() => {
    if (monthlySalary <= 0) {
      Alert.alert(
        'Salario no configurado',
        'Configura tu salario mensual en los ajustes para usar la plantilla 50/30/20.',
      )
      return
    }
    Alert.alert(
      'Aplicar plantilla 50/30/20',
      `Se distribuirá tu salario de ${monthlySalary.toLocaleString('es-ES')}€:\n• 50% necesidades (fijos)\n• 30% deseos (variables)\n• 20% ahorro\n\nEsto reemplazará los presupuestos actuales.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar',
          onPress: () => applyTemplate(monthlySalary),
        },
      ],
    )
  }, [monthlySalary, applyTemplate])

  const handleToggleRecurring = useCallback(
    async (id: string, active: boolean) => {
      await updateRecurringExpense(id, { active: !active })
      await loadData()
    },
    [loadData],
  )

  const handleDeleteBudget = useCallback(
    (id: string, name: string) => {
      Alert.alert(
        'Eliminar presupuesto',
        `¿Eliminar el presupuesto de ${name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => removeBudget(id) },
        ],
      )
    },
    [removeBudget],
  )

  const renderMonthSelector = () => (
    <View style={styles.monthSelector}>
      <Pressable onPress={handlePreviousMonth} style={styles.monthButton}>
        <Icon name="chevron.left" size={20} color={Colors.textSecondary} />
      </Pressable>
      <Text style={styles.monthText}>
        {MONTH_NAMES[currentMonth - 1]} {currentYear}
      </Text>
      <Pressable onPress={handleNextMonth} style={styles.monthButton}>
        <Icon name="chevron.left" size={20} color={Colors.textSecondary} />
      </Pressable>
    </View>
  )

  const renderTabs = () => (
    <View style={styles.tabs}>
      <Pressable
        onPress={() => setActiveTab('budgets')}
        style={[styles.tab, activeTab === 'budgets' && styles.tabActive]}
      >
        <Text style={[styles.tabText, activeTab === 'budgets' && styles.tabTextActive]}>
          Presupuestos
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setActiveTab('recurring')}
        style={[styles.tab, activeTab === 'recurring' && styles.tabActive]}
      >
        <Text style={[styles.tabText, activeTab === 'recurring' && styles.tabTextActive]}>
          Recurrentes
        </Text>
      </Pressable>
    </View>
  )

  const renderBudgets = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      <BudgetSummary summary={summary} salary={monthlySalary} />

      <View style={styles.actions}>
        <Button
          title="Aplicar 50/30/20"
          onPress={handleApplyTemplate}
          variant="secondary"
          style={styles.templateButton}
        />
      </View>

      {budgets.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="chart.pie.fill" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Sin presupuestos</Text>
          <Text style={styles.emptyText}>
            Añade presupuestos por categoría o aplica la plantilla 50/30/20
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {budgets.map((budget) => (
            <BudgetItem
              key={budget.id}
              budget={budget}
              onPress={() =>
                handleDeleteBudget(budget.id, budget.category_name)
              }
            />
          ))}
        </View>
      )}
    </Animated.View>
  )

  const renderRecurring = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      {recurringExpenses.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="repeat.circle.fill" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Sin gastos recurrentes</Text>
          <Text style={styles.emptyText}>
            Añade tus gastos fijos mensuales para llevar un mejor control
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {recurringExpenses.map((expense) => (
            <RecurringExpenseItem
              key={expense.id}
              id={expense.id}
              amount={expense.amount}
              day_of_month={expense.day_of_month}
              description={expense.description}
              category_name={expense.category_name}
              category_icon={expense.category_icon}
              category_color={expense.category_color}
              active={expense.active}
              onPress={() => router.push(`/recurring/add?id=${expense.id}` as any)}
              onToggle={() => handleToggleRecurring(expense.id, expense.active)}
            />
          ))}
        </View>
      )}
    </Animated.View>
  )

  if (isLoading && budgets.length === 0 && recurringExpenses.length === 0) {
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
        <Text style={styles.title}>Presupuestos</Text>
        {renderMonthSelector()}
        {renderTabs()}

        {activeTab === 'budgets' ? renderBudgets() : renderRecurring()}
      </ScrollView>

      <Pressable
        onPress={() =>
          router.push(
            (activeTab === 'budgets'
              ? '/budget/add'
              : '/recurring/add') as any,
          )
        }
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    minWidth: 160,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.accentCyan + '20',
  },
  tabText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.accentCyan,
    fontWeight: FontWeight.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  templateButton: {
    flex: 1,
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
