import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  Alert,
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
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { useLoansStore } from '@/stores/loans'
import type { AmortizationType, LoanType } from '@/types'

export default function AddLoanScreen() {
  const router = useRouter()
  const { addLoan, generateSchedule } = useLoansStore()

  const [type, setType] = useState<LoanType>('received')
  const [person, setPerson] = useState('')
  const [principal, setPrincipal] = useState('')
  const [interestRate, setInterestRate] = useState('0')
  const [termMonths, setTermMonths] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [amortizationType, setAmortizationType] = useState<AmortizationType>('french')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!person.trim()) {
      Alert.alert('Error', 'Introduce el nombre de la persona')
      return
    }
    const principalNum = parseFloat(principal.replace(',', '.'))
    if (isNaN(principalNum) || principalNum <= 0) {
      Alert.alert('Error', 'Introduce una cantidad válida')
      return
    }
    const rateNum = parseFloat(interestRate.replace(',', '.'))
    if (isNaN(rateNum) || rateNum < 0) {
      Alert.alert('Error', 'Introduce una tasa de interés válida')
      return
    }
    const termNum = parseInt(termMonths, 10)
    if (isNaN(termNum) || termNum <= 0) {
      Alert.alert('Error', 'Introduce un plazo válido en meses')
      return
    }

    setIsSaving(true)
    try {
      const loanId = await addLoan({
        type,
        person: person.trim(),
        principal: principalNum,
        interest_rate: rateNum,
        term_months: termNum,
        start_date: startDate,
        status: 'active',
        amortization_type: amortizationType,
        description: description.trim(),
      })

      await generateSchedule(loanId)
      router.back()
    } catch {
      Alert.alert('Error', 'No se pudo crear el préstamo')
      setIsSaving(false)
    }
  }, [type, person, principal, interestRate, termMonths, startDate, amortizationType, description, addLoan, generateSchedule, router])

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
          <Text style={styles.title}>Nuevo préstamo</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Tipo</Text>
          <View style={styles.typeToggle}>
            <Pressable
              onPress={() => setType('received')}
              style={[styles.typeButton, type === 'received' && styles.typeButtonActiveDanger]}
            >
              <Text style={[styles.typeText, type === 'received' && styles.typeTextActive]}>
                Me prestan (debo)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setType('given')}
              style={[styles.typeButton, type === 'given' && styles.typeButtonActiveSuccess]}
            >
              <Text style={[styles.typeText, type === 'given' && styles.typeTextActive]}>
                Presté (me deben)
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Persona</Text>
          <TextInput
            style={styles.textInput}
            value={person}
            onChangeText={setPerson}
            placeholder="Nombre de la persona"
            placeholderTextColor={Colors.textSecondary}
            autoFocus
          />

          <Text style={styles.sectionTitle}>Capital (€)</Text>
          <TextInput
            style={styles.textInput}
            value={principal}
            onChangeText={setPrincipal}
            keyboardType="decimal-pad"
            placeholder="0,00"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.sectionTitle}>Tasa de interés anual (%)</Text>
          <TextInput
            style={styles.textInput}
            value={interestRate}
            onChangeText={setInterestRate}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.sectionTitle}>Plazo (meses)</Text>
          <TextInput
            style={styles.textInput}
            value={termMonths}
            onChangeText={setTermMonths}
            keyboardType="number-pad"
            placeholder="12"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.sectionTitle}>Fecha de inicio</Text>
          <TextInput
            style={styles.textInput}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.sectionTitle}>Amortización</Text>
          <View style={styles.typeToggle}>
            <Pressable
              onPress={() => setAmortizationType('french')}
              style={[styles.typeButton, amortizationType === 'french' && styles.typeButtonActive]}
            >
              <Text style={[styles.typeText, amortizationType === 'french' && styles.typeTextActive]}>
                Francesa
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setAmortizationType('german')}
              style={[styles.typeButton, amortizationType === 'german' && styles.typeButtonActive]}
            >
              <Text style={[styles.typeText, amortizationType === 'german' && styles.typeTextActive]}>
                Alemana
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Notas (opcional)</Text>
          <TextInput
            style={[styles.textInput, { minHeight: 60 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción del préstamo..."
            placeholderTextColor={Colors.textSecondary}
            multiline
          />

          <Button
            title="Crear préstamo"
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveButton}
          />
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
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: -Spacing.sm,
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
  typeButtonActiveDanger: {
    backgroundColor: Colors.expense.start + '30',
  },
  typeButtonActiveSuccess: {
    backgroundColor: Colors.savings + '30',
  },
  typeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  textInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
})
