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
  createBudget,
  getAllCategories,
  getBudgetByCategory,
  getBudgetById,
  updateBudget,
} from '@/database/queries'
import type { Category } from '@/types'

export default function AddBudgetScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const cats = await getAllCategories()
      const expenseCats = cats.filter((c) => c.type === 'expense')
      setCategories(expenseCats)

      if (id) {
        const budget = await getBudgetById(id)
        if (budget) {
          setSelectedCategory(budget.category_id)
          setAmount(String(budget.amount))
          setEditingId(budget.id)
        }
      }
      setIsLoading(false)
    }
    load()
  }, [id])

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

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

    setIsSaving(true)
    try {
      if (editingId) {
        await updateBudget(editingId, { amount: amountNum })
      } else {
        const existing = await getBudgetByCategory(selectedCategory, currentYear, currentMonth)
        if (existing) {
          Alert.alert(
            'Ya existe',
            'Ya tienes un presupuesto para esta categoría este mes. ¿Quieres actualizarlo?',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Actualizar',
                onPress: async () => {
                  await updateBudget(existing.id, { amount: amountNum })
                  router.back()
                },
              },
            ],
          )
          setIsSaving(false)
          return
        }
        await createBudget({
          category_id: selectedCategory,
          month: currentMonth,
          year: currentYear,
          amount: amountNum,
        })
      }
      router.back()
    } catch {
      Alert.alert('Error', 'No se pudo guardar el presupuesto')
      setIsSaving(false)
    }
  }, [selectedCategory, amount, editingId, currentMonth, currentYear, router])

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
            {editingId ? 'Editar presupuesto' : 'Nuevo presupuesto'}
          </Text>
          <View style={styles.backButton} />
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

          <Text style={styles.sectionTitle}>Cantidad mensual</Text>
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

          <Button
            title={editingId ? 'Guardar cambios' : 'Crear presupuesto'}
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
  saveButton: {
    marginTop: Spacing.md,
  },
})
