import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui'
import { Card } from '@/components/ui/Card'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency, formatDate } from '@/utils/format'
import { deleteTransaction, getAllCategories, getTransactionById } from '@/database/queries'
import type { Category, Transaction } from '@/types'

export default function TransactionDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!id) return
      const t = await getTransactionById(id)
      if (t) {
        setTransaction(t)
        const cats = await getAllCategories()
        const cat = cats.find((c) => c.id === t.category_id)
        if (cat) setCategory(cat)
      }
      setIsLoading(false)
    }
    load()
  }, [id])

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (transaction) {
              await deleteTransaction(transaction.id)
              router.back()
            }
          },
        },
      ],
    )
  }, [transaction, router])

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accentCyan} />
        </View>
      </SafeAreaView>
    )
  }

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Transacción no encontrada</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron.left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Detalle</Text>
        <Pressable onPress={() => router.push(`/transaction/add?id=${transaction.id}` as any)} style={styles.backButton}>
          <Icon name="target" size={20} color={Colors.accentCyan} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.heroCard}>
          {category && (
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
              <Icon name={category.icon} size={32} color={category.color} />
            </View>
          )}
          <Text style={styles.heroAmount}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          <Text style={[styles.heroType, { color: transaction.type === 'income' ? Colors.savings : Colors.danger }]}>
            {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
          </Text>
        </Card>

        <Card>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Categoría</Text>
            <Text style={styles.detailValue}>{category?.name ?? 'Sin categoría'}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha</Text>
            <Text style={styles.detailValue}>{formatDate(transaction.date)}</Text>
          </View>
          {transaction.description ? (
            <>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Descripción</Text>
                <Text style={styles.detailValue}>{transaction.description}</Text>
              </View>
            </>
          ) : null}
          {transaction.tag ? (
            <>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Etiqueta</Text>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{transaction.tag}</Text>
                </View>
              </View>
            </>
          ) : null}
        </Card>

        <Button
          title="Eliminar transacción"
          onPress={handleDelete}
          variant="ghost"
          style={styles.deleteButton}
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
  heroCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroAmount: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  heroType: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  tagBadge: {
    backgroundColor: Colors.accentCyan + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: FontSize.sm,
    color: Colors.accentCyan,
    fontWeight: FontWeight.medium,
  },
  deleteButton: {
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
})
