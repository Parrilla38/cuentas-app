import { useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Icon } from '@/components/ui/Icon'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency, formatPercentage } from '@/utils/format'
import { useReportsStore } from '@/stores/reports'
import { generateCSV } from '@/services/report-generator'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function ReportsScreen() {
  const { isLoading, data, currentMonth, currentYear, loadData, setMonth } = useReportsStore()

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

  const handleExportCSV = useCallback(async () => {
    if (!data) return
    try {
      const csv = generateCSV(data)
      await Share.share({
        message: csv,
        title: `Reporte ${MONTH_NAMES[currentMonth - 1]} ${currentYear}`,
      })
    } catch {
      Alert.alert('Error', 'No se pudo exportar el reporte')
    }
  }, [data, currentMonth, currentYear])

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accentCyan} />
        </View>
      </SafeAreaView>
    )
  }

  if (!data) return null

  const maxTrendValue = Math.max(
    ...data.trend.map((t) => Math.max(t.income, t.expense)),
    1,
  )

  const incomeChange = data.previousSummary.income > 0
    ? ((data.currentSummary.income - data.previousSummary.income) / data.previousSummary.income) * 100
    : 0

  const expenseChange = data.previousSummary.expense > 0
    ? ((data.currentSummary.expense - data.previousSummary.expense) / data.previousSummary.expense) * 100
    : 0

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
        <Text style={styles.title}>Reportes</Text>

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

        <Card>
          <Text style={styles.sectionTitle}>Resumen del mes</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Ingresos</Text>
              <Text style={[styles.summaryValue, { color: Colors.savings }]}>
                {formatCurrency(data.currentSummary.income)}
              </Text>
              {incomeChange !== 0 && (
                <Text style={[styles.changeText, { color: incomeChange > 0 ? Colors.savings : Colors.danger }]}>
                  {incomeChange > 0 ? '+' : ''}{formatPercentage(incomeChange)}
                </Text>
              )}
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Gastos</Text>
              <Text style={[styles.summaryValue, { color: Colors.danger }]}>
                {formatCurrency(data.currentSummary.expense)}
              </Text>
              {expenseChange !== 0 && (
                <Text style={[styles.changeText, { color: expenseChange > 0 ? Colors.danger : Colors.savings }]}>
                  {expenseChange > 0 ? '+' : ''}{formatPercentage(expenseChange)}
                </Text>
              )}
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Ahorro</Text>
              <Text style={[styles.summaryValue, { color: data.currentSummary.savings >= 0 ? Colors.savings : Colors.danger }]}>
                {formatCurrency(data.currentSummary.savings)}
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Tendencia (6 meses)</Text>
          <View style={styles.chartContainer}>
            {data.trend.map((t) => (
              <View key={`${t.year}-${t.month}`} style={styles.barGroup}>
                <View style={styles.bars}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max((t.income / maxTrendValue) * 80, 4),
                        backgroundColor: Colors.savings,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max((t.expense / maxTrendValue) * 80, 4),
                        backgroundColor: Colors.danger,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{t.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.savings }]} />
              <Text style={styles.legendText}>Ingresos</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
              <Text style={styles.legendText}>Gastos</Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Top 5 categorías</Text>
          {data.topCategories.length === 0 ? (
            <Text style={styles.emptyText}>Sin datos</Text>
          ) : (
            data.topCategories.map((cat, i) => {
              const maxAmount = data.topCategories[0]?.amount ?? 1
              return (
                <View key={cat.category_id} style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <Text style={styles.categoryRank}>{i + 1}</Text>
                    <View style={[styles.categoryIcon, { backgroundColor: cat.category_color + '20' }]}>
                      <Icon name={cat.category_icon} size={16} color={cat.category_color} />
                    </View>
                    <Text style={styles.categoryName}>{cat.category_name}</Text>
                  </View>
                  <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
                  <View style={styles.categoryBar}>
                    <View
                      style={[
                        styles.categoryBarFill,
                        {
                          width: `${(cat.amount / maxAmount) * 100}%`,
                          backgroundColor: cat.category_color,
                        },
                      ]}
                    />
                  </View>
                </View>
              )
            })
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Patrimonio neto</Text>
          <Text style={[styles.netWorth, { color: data.netWorth >= 0 ? Colors.savings : Colors.danger }]}>
            {formatCurrency(data.netWorth)}
          </Text>
          <Text style={styles.netWorthLabel}>Ingresos totales - Gastos totales</Text>
        </Card>

        <Button
          title="Exportar CSV"
          onPress={handleExportCSV}
          variant="secondary"
          style={styles.exportButton}
        />
      </ScrollView>
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
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  changeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: Spacing.md,
  },
  barGroup: {
    alignItems: 'center',
    gap: 4,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    width: 14,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  categoryRow: {
    marginBottom: Spacing.md,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  categoryRank: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    width: 16,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    flex: 1,
  },
  categoryAmount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  categoryBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  netWorth: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  netWorthLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: Spacing.md,
  },
  exportButton: {
    marginTop: Spacing.sm,
  },
})
