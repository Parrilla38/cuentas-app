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
  createTransaction,
  getAllCategories,
  getTransactionById,
  updateTransaction,
} from '@/database/queries'
import type { Category, TransactionType } from '@/types'

export default function AddTransactionScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()

  const [categories, setCategories] = useState<Category[]>([])
  const [type, setType] = useState<TransactionType>('expense')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const cats = await getAllCategories()
      setCategories(cats)

      if (id) {
        const t = await getTransactionById(id)
        if (t) {
          setType(t.type)
          setSelectedCategory(t.category_id)
          setAmount(String(t.amount))
          setDescription(t.description)
          setTag(t.tag ?? '')
          setDate(t.date)
          setEditingId(t.id)
        }
      }
      setIsLoading(false)
    }
    load()
  }, [id])

  const filteredCategories = categories.filter((c) => c.type === type)

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
      const data = {
        type,
        amount: amountNum,
        date,
        category_id: selectedCategory,
        description,
        tag: tag || null,
        loan_id: null,
        recurring_id: null,
      }

      if (editingId) {
        await updateTransaction(editingId, data)
      } else {
        await createTransaction(data)
      }
      router.back()
    } catch {
      Alert.alert('Error', 'No se pudo guardar la transacción')
      setIsSaving(false)
    }
  }, [type, selectedCategory, amount, date, description, tag, editingId, router])

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
            {editingId ? 'Editar transacción' : 'Nueva transacción'}
          </Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.typeToggle}>
            <Pressable
              onPress={() => setType('expense')}
              style={[styles.typeButton, type === 'expense' && styles.typeButtonExpenseActive]}
            >
              <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
                Gasto
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setType('income')}
              style={[styles.typeButton, type === 'income' && styles.typeButtonIncomeActive]}
            >
              <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
                Ingreso
              </Text>
            </Pressable>
          </View>

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

          <Text style={styles.sectionTitle}>Categoría</Text>
          <View style={styles.categoriesGrid}>
            {filteredCategories.map((cat) => {
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
                    <Icon name={cat.icon} size={22} color={cat.color} />
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

          <Text style={styles.sectionTitle}>Descripción</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Nota opcional"
            placeholderTextColor={Colors.textSecondary}
            multiline
          />

          <Text style={styles.sectionTitle}>Etiqueta</Text>
          <TextInput
            style={styles.textInput}
            value={tag}
            onChangeText={setTag}
            placeholder="Ej: vacaciones, proyecto X..."
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.sectionTitle}>Fecha</Text>
          <TextInput
            style={styles.textInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textSecondary}
          />

          <Button
            title={editingId ? 'Guardar cambios' : 'Añadir transacción'}
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
  typeButtonExpenseActive: {
    backgroundColor: Colors.expense.start + '30',
  },
  typeButtonIncomeActive: {
    backgroundColor: Colors.income.start + '30',
  },
  typeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
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
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: -Spacing.sm,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
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
