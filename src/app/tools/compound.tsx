import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui'
import { Card } from '@/components/ui/Card'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency } from '@/utils/format'
import { calculateCompoundInterest } from '@/services/loan-calculator'

interface Result {
  finalAmount: number
  totalContributions: number
  totalInterest: number
  yearlyBreakdown: { year: number; balance: number; contributions: number; interest: number }[]
}

export default function CompoundInterestScreen() {
  const router = useRouter()

  const [initial, setInitial] = useState('1000')
  const [monthly, setMonthly] = useState('100')
  const [rate, setRate] = useState('7')
  const [years, setYears] = useState('10')
  const [result, setResult] = useState<Result | null>(null)

  const handleCalculate = () => {
    const i = parseFloat(initial.replace(',', '.'))
    const m = parseFloat(monthly.replace(',', '.'))
    const r = parseFloat(rate.replace(',', '.'))
    const y = parseInt(years, 10)
    if (isNaN(i) || isNaN(m) || isNaN(r) || isNaN(y) || y <= 0) return

    const calc = calculateCompoundInterest(i, m, r, y)
    setResult(calc)
  }

  const maxBalance = result ? result.yearlyBreakdown[result.yearlyBreakdown.length - 1]?.balance ?? 1 : 1

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="chevron.left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Interés compuesto</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capital inicial (€)</Text>
            <TextInput
              style={styles.input}
              value={initial}
              onChangeText={setInitial}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Aportación mensual (€)</Text>
            <TextInput
              style={styles.input}
              value={monthly}
              onChangeText={setMonthly}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rentabilidad anual (%)</Text>
            <TextInput
              style={styles.input}
              value={rate}
              onChangeText={setRate}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Años</Text>
            <TextInput
              style={styles.input}
              value={years}
              onChangeText={setYears}
              keyboardType="number-pad"
            />
          </View>

          <Button title="Calcular" onPress={handleCalculate} />

          {result && (
            <>
              <Card style={styles.resultCard}>
                <Text style={styles.resultMainLabel}>Capital final</Text>
                <Text style={styles.resultMainValue}>{formatCurrency(result.finalAmount)}</Text>

                <View style={styles.resultGrid}>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Aportado</Text>
                    <Text style={styles.resultValue}>{formatCurrency(result.totalContributions)}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Intereses</Text>
                    <Text style={[styles.resultValue, { color: Colors.savings }]}>
                      {formatCurrency(result.totalInterest)}
                    </Text>
                  </View>
                </View>
              </Card>

              <Card>
                <Text style={styles.sectionTitle}>Evolución anual</Text>
                <View style={styles.chartContainer}>
                  {result.yearlyBreakdown.map((y) => (
                    <View key={y.year} style={styles.chartRow}>
                      <Text style={styles.chartYear}>Año {y.year}</Text>
                      <View style={styles.chartBarContainer}>
                        <View
                          style={[
                            styles.chartBarContributions,
                            { width: `${(y.contributions / maxBalance) * 100}%` },
                          ]}
                        />
                        <View
                          style={[
                            styles.chartBarInterest,
                            { width: `${((y.balance - y.contributions) / maxBalance) * 100}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.chartBalance}>{formatCurrency(y.balance)}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.income.start }]} />
                    <Text style={styles.legendText}>Aportaciones</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.savings }]} />
                    <Text style={styles.legendText}>Intereses</Text>
                  </View>
                </View>
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultCard: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  resultMainLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  resultMainValue: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.savings,
  },
  resultGrid: {
    flexDirection: 'row',
    width: '100%',
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  resultLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  resultValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  chartContainer: {
    gap: Spacing.sm,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chartYear: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    width: 40,
    fontWeight: FontWeight.medium,
  },
  chartBarContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  chartBarContributions: {
    height: '100%',
    backgroundColor: Colors.income.start,
  },
  chartBarInterest: {
    height: '100%',
    backgroundColor: Colors.savings,
  },
  chartBalance: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    width: 70,
    textAlign: 'right',
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
})
