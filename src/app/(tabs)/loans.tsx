import { useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
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
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency, formatDate } from '@/utils/format'
import { useLoansStore } from '@/stores/loans'
import type { LoanWithSummary } from '@/database/queries'

type Tab = 'given' | 'received'

export default function LoansScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('received')

  const { isLoading, loans, loadData } = useLoansStore()

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = useCallback(() => {
    loadData()
  }, [loadData])

  const filteredLoans = loans.filter((l) => l.type === activeTab)

  const totalGiven = loans
    .filter((l) => l.type === 'given')
    .reduce((sum, l) => sum + l.total_pending, 0)

  const totalReceived = loans
    .filter((l) => l.type === 'received')
    .reduce((sum, l) => sum + l.total_pending, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.savings
      case 'overdue': return Colors.danger
      case 'paid': return Colors.textSecondary
      default: return Colors.textSecondary
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'overdue': return 'Vencido'
      case 'paid': return 'Saldado'
      default: return status
    }
  }

  const renderLoanCard = (loan: LoanWithSummary) => {
    const progress = loan.principal > 0 ? loan.total_paid / loan.principal : 0
    const progressWidth = Math.min(progress * 100, 100)

    return (
      <Pressable
        key={loan.id}
        onPress={() => router.push(`/loan/${loan.id}` as any)}
      >
        <Card style={styles.loanCard}>
          <View style={styles.loanHeader}>
            <View style={styles.loanPersonRow}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(loan.status) }]} />
              <Text style={styles.loanPerson}>{loan.person}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(loan.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(loan.status) }]}>
                {getStatusLabel(loan.status)}
              </Text>
            </View>
          </View>

          <View style={styles.loanAmounts}>
            <View>
              <Text style={styles.loanLabel}>
                {loan.type === 'given' ? 'Me deben' : 'Debo'}
              </Text>
              <Text style={styles.loanPrincipal}>{formatCurrency(loan.principal)}</Text>
            </View>
            <View style={styles.loanRight}>
              <Text style={styles.loanLabel}>Pendiente</Text>
              <Text style={[styles.loanPending, { color: Colors.warning }]}>
                {formatCurrency(loan.total_pending)}
              </Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
          </View>

          {loan.next_payment_date && loan.status !== 'paid' && (
            <View style={styles.nextPayment}>
              <Text style={styles.nextPaymentLabel}>Próximo pago</Text>
              <Text style={styles.nextPaymentValue}>
                {formatCurrency(loan.next_payment_amount ?? 0)} · {formatDate(loan.next_payment_date)}
              </Text>
            </View>
          )}
        </Card>
      </Pressable>
    )
  }

  if (isLoading && loans.length === 0) {
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
        <Text style={styles.title}>Préstamos</Text>

        <View style={styles.summaryCards}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Me deben</Text>
            <Text style={[styles.summaryAmount, { color: Colors.savings }]}>
              {formatCurrency(totalGiven)}
            </Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Debo</Text>
            <Text style={[styles.summaryAmount, { color: Colors.danger }]}>
              {formatCurrency(totalReceived)}
            </Text>
          </Card>
        </View>

        <View style={styles.tabs}>
          <Pressable
            onPress={() => setActiveTab('received')}
            style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
              Debo
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('given')}
            style={[styles.tab, activeTab === 'given' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'given' && styles.tabTextActive]}>
              Me deben
            </Text>
          </Pressable>
        </View>

        {filteredLoans.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="hand.raised.fill" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Sin préstamos</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'received'
                ? 'No tienes deudas pendientes'
                : 'Nadie te debe dinero'}
            </Text>
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)} style={styles.list}>
            {filteredLoans.map(renderLoanCard)}
          </Animated.View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/loan/add' as any)}
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
  summaryCards: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  summaryAmount: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
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
  },
  list: {
    gap: Spacing.md,
  },
  loanCard: {
    gap: Spacing.sm,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loanPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loanPerson: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  loanAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loanLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  loanPrincipal: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  loanRight: {
    alignItems: 'flex-end',
  },
  loanPending: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.savings,
    borderRadius: 3,
  },
  nextPayment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextPaymentLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  nextPaymentValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
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
