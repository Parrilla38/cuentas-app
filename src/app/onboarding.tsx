import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useState, useCallback } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { FIXED_EXPENSE_OPTIONS } from '@/constants/categories'
import { seedDefaultCategories } from '@/services/seed'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/utils/format'

const SAVINGS_OPTIONS = [10, 20, 30, 50]

export default function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const [salary, setSalary] = useState('')
  const [selectedFixedExpenses, setSelectedFixedExpenses] = useState<string[]>(
    FIXED_EXPENSE_OPTIONS.filter((o) => o.defaultSelected).map((o) => o.name),
  )
  const [savingsPercentage, setSavingsPercentage] = useState(20)
  const [isCompleting, setIsCompleting] = useState(false)

  const router = useRouter()
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)

  const toggleFixedExpense = useCallback((name: string) => {
    setSelectedFixedExpenses((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    )
  }, [])

  const handleNext = useCallback(() => {
    setStep((prev) => prev + 1)
  }, [])

  const handleBack = useCallback(() => {
    setStep((prev) => prev - 1)
  }, [])

  const handleComplete = useCallback(async () => {
    if (isCompleting) return
    setIsCompleting(true)
    try {
      await seedDefaultCategories(selectedFixedExpenses)
      await completeOnboarding(parseFloat(salary) || 0, savingsPercentage)
      router.replace('/(tabs)')
    } catch {
      setIsCompleting(false)
    }
  }, [isCompleting, selectedFixedExpenses, salary, savingsPercentage, completeOnboarding, router])

  const salaryNumber = parseFloat(salary) || 0
  const savingsAmount = (salaryNumber * savingsPercentage) / 100

  const renderWelcome = () => (
    <Animated.View entering={FadeIn.duration(600)} style={styles.stepContainer}>
      <LinearGradient
        colors={[Colors.income.start, Colors.income.end, Colors.accentCyan]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeGradient}
      >
        <View style={styles.welcomeIconContainer}>
          <Icon name="eurosign.circle.fill" size={80} color="#fff" />
        </View>
        <Text style={styles.welcomeTitle}>Cuentas</Text>
        <Text style={styles.welcomeSubtitle}>Tu dinero, bajo control</Text>
        <Text style={styles.welcomeDescription}>
          Gestiona tus ingresos, gastos, préstamos y ahorros en un solo lugar.
          Tus datos se sincronizan en la nube para acceder desde cualquier dispositivo.
        </Text>
        <View style={styles.welcomeFeatures}>
          <View style={styles.featureRow}>
            <Icon name="chart.pie.fill" size={20} color={Colors.accentCyan} />
            <Text style={styles.featureText}>Presupuestos inteligentes</Text>
          </View>
          <View style={styles.featureRow}>
            <Icon name="arrow.triangle.2.circlepath" size={20} color={Colors.accentCyan} />
            <Text style={styles.featureText}>Sincronización en tiempo real</Text>
          </View>
          <View style={styles.featureRow}>
            <Icon name="target" size={20} color={Colors.accentCyan} />
            <Text style={styles.featureText}>Metas de ahorro</Text>
          </View>
        </View>
        <Button title="Empezar" onPress={handleNext} style={styles.welcomeButton} />
      </LinearGradient>
    </Animated.View>
  )

  const renderSalary = () => (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Icon name="eurosign.circle.fill" size={48} color={Colors.accentCyan} />
        <Text style={styles.stepTitle}>¿Cuánto ganas al mes?</Text>
        <Text style={styles.stepDescription}>
          Introduce tu salario mensual neto para personalizar tus presupuestos
        </Text>
      </View>

      <View style={styles.salaryInputContainer}>
        <TextInput
          style={styles.salaryInput}
          value={salary}
          onChangeText={setSalary}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={Colors.textSecondary}
          autoFocus
        />
        <Text style={styles.salaryCurrency}>€</Text>
      </View>

      {salaryNumber > 0 && (
        <Text style={styles.salaryPreview}>
          {formatCurrency(salaryNumber)} al mes
        </Text>
      )}

      <View style={styles.stepFooter}>
        <Button
          title="Siguiente"
          onPress={handleNext}
          disabled={salaryNumber <= 0}
          style={styles.nextButton}
        />
      </View>
    </Animated.View>
  )

  const renderFixedExpenses = () => (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Icon name="repeat.circle.fill" size={48} color={Colors.accentCyan} />
        <Text style={styles.stepTitle}>¿Cuáles son tus gastos fijos?</Text>
        <Text style={styles.stepDescription}>
          Selecciona los gastos que tienes cada mes
        </Text>
      </View>

      <ScrollView style={styles.expensesList} showsVerticalScrollIndicator={false}>
        {FIXED_EXPENSE_OPTIONS.map((option) => {
          const isSelected = selectedFixedExpenses.includes(option.name)
          return (
            <Pressable
              key={option.name}
              onPress={() => toggleFixedExpense(option.name)}
              style={({ pressed }) => [
                styles.expenseItem,
                isSelected && styles.expenseItemSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.expenseItemLeft}>
                <Icon
                  name={option.icon}
                  size={24}
                  color={isSelected ? Colors.accentCyan : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.expenseItemText,
                    isSelected && styles.expenseItemTextSelected,
                  ]}
                >
                  {option.name}
                </Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && (
                  <Icon name="checkmark" size={14} color="#fff" />
                )}
              </View>
            </Pressable>
          )
        })}
      </ScrollView>

      <View style={styles.stepFooter}>
        <Button title="Siguiente" onPress={handleNext} style={styles.nextButton} />
      </View>
    </Animated.View>
  )

  const renderSavings = () => (
    <Animated.View entering={FadeIn.duration(400)} style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Icon name="target" size={48} color={Colors.savings} />
        <Text style={styles.stepTitle}>¿Cuánto quieres ahorrar?</Text>
        <Text style={styles.stepDescription}>
          Elige el porcentaje de tu salario que quieres ahorrar cada mes
        </Text>
      </View>

      <View style={styles.savingsOptions}>
        {SAVINGS_OPTIONS.map((pct) => (
          <Pressable
            key={pct}
            onPress={() => setSavingsPercentage(pct)}
            style={({ pressed }) => [
              styles.savingsOption,
              savingsPercentage === pct && styles.savingsOptionSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.savingsOptionText,
                savingsPercentage === pct && styles.savingsOptionTextSelected,
              ]}
            >
              {pct}%
            </Text>
          </Pressable>
        ))}
      </View>

      {salaryNumber > 0 && (
        <View style={styles.savingsPreview}>
          <Text style={styles.savingsPreviewLabel}>Ahorro mensual estimado</Text>
          <Text style={styles.savingsPreviewAmount}>{formatCurrency(savingsAmount)}</Text>
          <Text style={styles.savingsPreviewYearly}>
            {formatCurrency(savingsAmount * 12)} al año
          </Text>
        </View>
      )}

      <View style={styles.stepFooter}>
        <Button
          title="Finalizar"
          onPress={handleComplete}
          disabled={isCompleting}
          style={styles.nextButton}
        />
      </View>
    </Animated.View>
  )

  const renderStep = () => {
    switch (step) {
      case 0:
        return renderWelcome()
      case 1:
        return renderSalary()
      case 2:
        return renderFixedExpenses()
      case 3:
        return renderSavings()
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {step > 0 && (
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Icon name="chevron.left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.progressDots}>
            {[1, 2, 3].map((dotStep) => (
              <View
                key={dotStep}
                style={[
                  styles.dot,
                  dotStep <= step && styles.dotActive,
                  dotStep === step && styles.dotCurrent,
                ]}
              />
            ))}
          </View>
          <View style={styles.backButton} />
        </View>
      )}
      {renderStep()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
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
  progressDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
  },
  dotActive: {
    backgroundColor: Colors.accentCyan,
  },
  dotCurrent: {
    width: 24,
    backgroundColor: Colors.accentCyan,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  stepHeader: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepFooter: {
    marginTop: 'auto' as unknown as number,
    paddingBottom: Spacing.xl,
  },
  nextButton: {
    marginTop: Spacing.lg,
  },
  welcomeGradient: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.md,
  },
  welcomeIconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.lg,
  },
  welcomeDescription: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  welcomeFeatures: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  featureText: {
    fontSize: FontSize.md,
    color: '#FFFFFF',
    fontWeight: FontWeight.medium,
  },
  welcomeButton: {
    width: '100%',
  },
  salaryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  salaryInput: {
    fontSize: 56,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 120,
  },
  salaryCurrency: {
    fontSize: 40,
    fontWeight: FontWeight.light,
    color: Colors.accentCyan,
    marginLeft: Spacing.sm,
  },
  salaryPreview: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  expensesList: {
    flex: 1,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expenseItemSelected: {
    borderColor: Colors.accentCyan,
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  expenseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  expenseItemText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  expenseItemTextSelected: {
    color: Colors.textPrimary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.accentCyan,
    borderColor: Colors.accentCyan,
  },
  savingsOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  savingsOption: {
    width: '45%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  savingsOptionSelected: {
    borderColor: Colors.savings,
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  savingsOptionText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  savingsOptionTextSelected: {
    color: Colors.savings,
  },
  savingsPreview: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  savingsPreviewLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  savingsPreviewAmount: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.savings,
  },
  savingsPreviewYearly: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
})
