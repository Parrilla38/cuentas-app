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
import { calculateLoan, type AmortizationRow } from '@/services/loan-calculator'
import type { AmortizationType } from '@/types'

export default function LoanCalculatorScreen() {
  const router = useRouter()

  const [principal, setPrincipal] = useState('10000')
  const [rate, setRate] = useState('5')
  const [term, setTerm] = useState('24')
  const [amortType, setAmortType] = useState<AmortizationType>('french')
  const [result, setResult] = useState<{ monthlyPayment: number; totalPayment: number; totalInterest: number; schedule: AmortizationRow[] } | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)

  const handleCalculate = () => {
    const p = parseFloat(principal.replace(',', '.'))
    const r = parseFloat(rate.replace(',', '.'))
    const t = parseInt(term, 10)
    if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || t <= 0) return

    const calc = calculateLoan(p, r, t, new Date().toISOString().split('T')[0], amortType)
    setResult(calc)
    setShowSchedule(false)
  }

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
          <Text style={styles.title}>Calculadora de préstamos</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capital (€)</Text>
            <TextInput
              style={styles.input}
              value={principal}
              onChangeText={setPrincipal}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tasa de interés anual (%)</Text>
            <TextInput
              style={styles.input}
              value={rate}
              onChangeText={setRate}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Plazo (meses)</Text>
            <TextInput
              style={styles.input}
              value={term}
              onChangeText={setTerm}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.typeToggle}>
            <Pressable
              onPress={() => setAmortType('french')}
              style={[styles.typeButton, amortType === 'french' && styles.typeButtonActive]}
            >
              <Text style={[styles.typeText, amortType === 'french' && styles.typeTextActive]}>Francesa</Text>
            </Pressable>
            <Pressable
              onPress={() => setAmortType('german')}
              style={[styles.typeButton, amortType === 'german' && styles.typeButtonActive]}
            >
              <Text style={[styles.typeText, amortType === 'german' && styles.typeTextActive]}>Alemana</Text>
            </Pressable>
          </View>

          <Button title="Calcular" onPress={handleCalculate} />

          {result && (
            <>
              <Card style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Cuota mensual</Text>
                  <Text style={[styles.resultValue, { color: Colors.accentCyan }]}>
                    {formatCurrency(result.monthlyPayment)}
                  </Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Total a pagar</Text>
                  <Text style={styles.resultValue}>{formatCurrency(result.totalPayment)}</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Total intereses</Text>
                  <Text style={[styles.resultValue, { color: Colors.danger }]}>
                    {formatCurrency(result.totalInterest)}
                  </Text>
                </View>
              </Card>

              <Button
                title={showSchedule ? 'Ocultar tabla' : 'Ver tabla de amortización'}
                onPress={() => setShowSchedule(!showSchedule)}
                variant="secondary"
              />

              {showSchedule && (
                <Card style={styles.scheduleCard}>
                  <View style={styles.scheduleHeader}>
                    <Text style={styles.scheduleHeaderText}>Mes</Text>
                    <Text style={styles.scheduleHeaderText}>Cuota</Text>
                    <Text style={styles.scheduleHeaderText}>Capital</Text>
                    <Text style={styles.scheduleHeaderText}>Interés</Text>
                    <Text style={styles.scheduleHeaderText}>Pendiente</Text>
                  </View>
                  {result.schedule.map((row) => (
                    <View key={row.month} style={styles.scheduleRow}>
                      <Text style={styles.scheduleCell}>{row.month}</Text>
                      <Text style={styles.scheduleCell}>{formatCurrency(row.payment)}</Text>
                      <Text style={styles.scheduleCell}>{formatCurrency(row.principal)}</Text>
                      <Text style={styles.scheduleCell}>{formatCurrency(row.interest)}</Text>
                      <Text style={styles.scheduleCell}>{formatCurrency(row.remainingBalance)}</Text>
                    </View>
                  ))}
                </Card>
              )}
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
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.accentCyan + '20',
  },
  typeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.accentCyan,
    fontWeight: FontWeight.semibold,
  },
  resultCard: {
    gap: 0,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resultLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  resultValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  scheduleCard: {
    padding: 0,
  },
  scheduleHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardSolid,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scheduleHeaderText: {
    flex: 1,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scheduleRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scheduleCell: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
})
