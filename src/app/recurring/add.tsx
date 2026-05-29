import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
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
import {
  createRecurringExpense,
  getAllCategories,
  getRecurringExpenseById,
  updateRecurringExpense,
  deleteRecurringExpense,
} from '@/database/queries'
import type { Category } from '@/types'

export default function AddRecurringScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const cats = await getAllCategories()
      const expenseCats = cats.filter((c) => c.type === 'expense')
      setCategories(expenseCats)

      if (id) {
        const expense = await getRecurringExpenseById(id)
        if (expense) {
          setSelectedCategory(expense.category_id)
          setAmount(String(expense.amount))
          setDayOfMonth(String(expense.day_of_month))
          setDescription(expense.description)
          setEditingId(expense.id)
        }
      }
      setIsLoading(false)
    }
    load()
  }, [id])

  const handleSave = useCallback(async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Selecciona una categoría')
      return
    }
    const amountNum = parseFloat(amount.replace(',', '.'))
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Introduce una cantidad válida')
      return
    }
    const day = parseInt(dayOfMonth, 10)
    if (isNaN(day) || day < 1 || day > 31) {
      Alert.alert('Error', 'El día debe estar entre 1 y 31')
      return
    }

    setIsSaving(true)
    try {
      if (editingId) {
        await updateRecurringExpense(editingId, {
          category_id: selectedCategory,
          amount: amountNum,
          day_of_month: day,
          description,
        })
      } else {
        await createRecurringExpense({
          category_id: selectedCategory,
          amount: amountNum,
          day_of_month: day,
          description,
          active: true,
        })
      }
      router.back()
    } catch {
      Alert.alert('Error', 'No se pudo guardar el gasto recurrente')
      setIsSaving(false)
    }
  }, [selectedCategory, amount, dayOfMonth, description, editingId, router])

  const handleDelete = useCallback(() => {
    if (!editingId) return
    Alert.alert(
      'Eliminar gasto recurrente',
      '¿Estás seguro de que quieres eliminar este gasto recurrente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteRecurringExpense(editingId)
            router.back()
          },
        },
      ],
    )
  }, [editingId, router])

  if (isLoading) {
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="chevron.left" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>
            {editingId ? 'Editar recurrente' : 'Nuevo recurrente'}
          </Text>
          {editingId ? (
            <Pressable onPress={handleDelete} style={styles.backButton}>
              <Icon name="exclamationmark.triangle.fill" size={20} color={Colors.danger} />
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Categoría</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categoryItem,
                    isSelected && { borderColor: cat.color, backgroundColor: cat.color + '15' },
                  ]}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                    <Icon name={cat.icon} size={24} color={cat.color} />
                  </View>
                  <Text
                    style={[styles.categoryName, isSelected && { color: Colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.sectionTitle}>Cantidad</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={Colors.textSecondary}
              autoFocus={!editingId}
            />
            <Text style={styles.currency}>€</Text>
          </View>

          <Text style={styles.sectionTitle}>Día del mes</Text>
          <View style={styles.dayContainer}>
            <TextInput
              style={styles.dayInput}
              value={dayOfMonth}
              onChangeText={setDayOfMonth}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={Colors.textSecondary}
              maxLength={2}
            />
            <Text style={styles.dayLabel}>de cada mes</Text>
          </View>

          <Text style={styles.sectionTitle}>Descripción (opcional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Netflix, Alquiler..."
            placeholderTextColor={Colors.textSecondary}
            maxLength={100}
          />

          <Button
            title={editingId ? 'Guardar cambios' : 'Crear gasto recurrente'}
            onPress={handleSave}
            disabled={isSaving || !selectedCategory || !amount}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: Spacing.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
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
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  dayInput: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 48,
  },
  dayLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  descriptionInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
})
