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
import { useSavingsStore } from '@/stores/savings'

const ICON_OPTIONS = [
  { name: 'target', label: 'Objetivo' },
  { name: 'star.fill', label: 'Estrella' },
  { name: 'house.fill', label: 'Casa' },
  { name: 'car.fill', label: 'Coche' },
  { name: 'gift.fill', label: 'Regalo' },
  { name: 'dumbbell.fill', label: 'Fitness' },
  { name: 'book.fill', label: 'Estudios' },
  { name: 'eurosign.circle.fill', label: 'Euro' },
]

const COLOR_OPTIONS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#F59E0B', '#10B981', '#22D3EE',
  '#3B82F6', '#14B8A6',
]

export default function AddSavingsGoalScreen() {
  const router = useRouter()
  const { addGoal } = useSavingsStore()

  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('target')
  const [selectedColor, setSelectedColor] = useState('#6366F1')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Introduce un nombre para la meta')
      return
    }
    const target = parseFloat(targetAmount.replace(',', '.'))
    if (isNaN(target) || target <= 0) {
      Alert.alert('Error', 'Introduce una cantidad objetivo válida')
      return
    }

    setIsSaving(true)
    try {
      await addGoal({
        name: name.trim(),
        target_amount: target,
        current_amount: 0,
        deadline: deadline || null,
        color: selectedColor,
        icon: selectedIcon,
      })
      router.back()
    } catch {
      Alert.alert('Error', 'No se pudo crear la meta')
      setIsSaving(false)
    }
  }, [name, targetAmount, deadline, selectedIcon, selectedColor, addGoal, router])

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
          <Text style={styles.title}>Nueva meta</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Nombre de la meta</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Vacaciones, Coche nuevo..."
            placeholderTextColor={Colors.textSecondary}
            autoFocus
          />

          <Text style={styles.sectionTitle}>Objetivo (€)</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={Colors.textSecondary}
            />
            <Text style={styles.currency}>€</Text>
          </View>

          <Text style={styles.sectionTitle}>Fecha objetivo (opcional)</Text>
          <TextInput
            style={styles.textInput}
            value={deadline}
            onChangeText={setDeadline}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.sectionTitle}>Icono</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map((opt) => (
              <Pressable
                key={opt.name}
                onPress={() => setSelectedIcon(opt.name)}
                style={[
                  styles.iconItem,
                  selectedIcon === opt.name && { borderColor: selectedColor, backgroundColor: selectedColor + '15' },
                ]}
              >
                <Icon name={opt.name} size={24} color={selectedIcon === opt.name ? selectedColor : Colors.textSecondary} />
                <Text style={styles.iconLabel}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((color) => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorItem,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorItemSelected,
                ]}
              />
            ))}
          </View>

          <Button
            title="Crear meta"
            onPress={handleSave}
            disabled={isSaving || !name || !targetAmount}
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
    gap: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: -Spacing.sm,
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 100,
  },
  currency: {
    fontSize: 32,
    fontWeight: FontWeight.light,
    color: Colors.accentCyan,
    marginLeft: Spacing.sm,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  iconItem: {
    width: '23%',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  iconLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorItemSelected: {
    borderWidth: 3,
    borderColor: Colors.textPrimary,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
})
