import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Icon } from '@/components/ui/Icon'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency, formatDate } from '@/utils/format'
import { useTransactionsStore } from '@/stores/transactions'
import type { Transaction, TransactionType } from '@/types'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

type Filter = TransactionType | 'all'

export default function TransactionsScreen() {
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)

  const {
    isLoading,
    transactions,
    categories,
    monthSummary,
    currentMonth,
    currentYear,
    filter,
    searchQuery,
    loadData,
    setMonth,
    setFilter,
    setSearchQuery,
    filteredTransactions,
  } = useTransactionsStore()

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = useCallback(() => {
    loadData()
  }, [loadData])

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

  const result = useMemo(() => filteredTransactions(), [filteredTransactions])

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    for (const t of result) {
      const key = t.date
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [result])

  const getCategoryInfo = useCallback(
    (categoryId: string) => {
      return categories.find((c) => c.id === categoryId) ?? {
        name: 'Sin categoría',
        icon: 'ellipsis.circle.fill',
        color: Colors.textSecondary,
      }
    },
    [categories],
  )

  const renderFilter = (value: Filter, label: string) => (
    <Pressable
      key={value}
      onPress={() => setFilter(value)}
      style={[styles.filterChip, filter === value && styles.filterChipActive]}
    >
      <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
  )

  if (isLoading && transactions.length === 0) {
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>Movimientos</Text>
          <Pressable onPress={() => setSearchOpen(!searchOpen)} style={styles.searchToggle}>
            <Icon name="target" size={20} color={searchOpen ? Colors.accentCyan : Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.monthSelector}>
          <Pressable onPress={handlePreviousMonth} style={styles.monthButton}>
            <Icon name="chevron.left" size={20} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.monthText}>
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </Text>
          <Pressable onPress={handleNextMonth} style={styles.monthButton}>
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <Icon name="chevron.left" size={20} color={Colors.textSecondary} />
            </View>
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={[styles.summaryValue, { color: Colors.savings }]}>
              {formatCurrency(monthSummary.income)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gastos</Text>
            <Text style={[styles.summaryValue, { color: Colors.danger }]}>
              {formatCurrency(monthSummary.expense)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Ahorro</Text>
            <Text style={[styles.summaryValue, { color: monthSummary.savings >= 0 ? Colors.savings : Colors.danger }]}>
              {formatCurrency(monthSummary.savings)}
            </Text>
          </View>
        </View>

        {searchOpen && (
          <Animated.View entering={FadeIn.duration(200)}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por descripción, categoría o tag..."
              placeholderTextColor={Colors.textSecondary}
              autoFocus
            />
          </Animated.View>
        )}

        <View style={styles.filters}>
          {renderFilter('all', 'Todos')}
          {renderFilter('income', 'Ingresos')}
          {renderFilter('expense', 'Gastos')}
        </View>

        {groupedByDate.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="arrow.triangle.2.circlepath" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Sin movimientos</Text>
            <Text style={styles.emptyText}>
              No hay transacciones para este período
            </Text>
          </View>
        ) : (
          groupedByDate.map(([date, txs]) => (
            <View key={date}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>
              {txs.map((t) => {
                const cat = getCategoryInfo(t.category_id)
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => router.push(`/transaction/${t.id}` as any)}
                    style={styles.transactionItem}
                  >
                    <View style={[styles.transactionIcon, { backgroundColor: cat.color + '20' }]}>
                      <Icon name={cat.icon} size={20} color={cat.color} />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionCategory} numberOfLines={1}>
                        {cat.name}
                      </Text>
                      {t.description ? (
                        <Text style={styles.transactionDesc} numberOfLines={1}>
                          {t.description}
                        </Text>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: t.type === 'income' ? Colors.savings : Colors.textPrimary },
                      ]}
                    >
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/transaction/add' as any)}
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
    gap: Spacing.md,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  searchToggle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
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
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  summaryValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  searchInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.accentCyan + '20',
    borderColor: Colors.accentCyan,
  },
  filterText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  filterTextActive: {
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
  dateHeader: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    gap: 2,
  },
  transactionCategory: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  transactionDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  transactionAmount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
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
