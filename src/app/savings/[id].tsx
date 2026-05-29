import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
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
import { formatCurrency, formatDate } from '@/utils/format'
import { useSavingsStore } from '@/stores/savings'

export default function SavingsGoalDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { selectedGoal, contributions, loadGoalDetail, addContribution, removeContribution, removeGoal } = useSavingsStore()
  const [contributionAmount, setContributionAmount] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (id) loadGoalDetail(id)
  }, [id, loadGoalDetail])

  const handleAddContribution = useCallback(async () => {
    const amount = parseFloat(contributionAmount.replace(',', '.'))
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Introduce una cantidad válida')
      return
    }
    if (!selectedGoal) return

    setIsAdding(true)
    try {
      await addContribution(selectedGoal.id, amount)
      setContributionAmount('')

      const updatedGoal = await import('@/database/queries').then(m => m.getSavingsGoalById(selectedGoal.id))
      if (updatedGoal && updatedGoal.current_amount >= updatedGoal.target_amount) {
        Alert.alert('Meta completada', `¡Felicidades! Has alcanzado tu meta de "${selectedGoal.name}"`)
      }
    } catch {
      Alert.alert('Error', 'No se pudo registrar el aporte')
    }
    setIsAdding(false)
  }, [contributionAmount, selectedGoal, addContribution])

  const handleDeleteContribution = useCallback(
    (contribId: string) => {
      Alert.alert('Eliminar aporte', '¿Eliminar este aporte?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => removeContribution(contribId) },
      ])
    },
    [removeContribution],
  )

  const handleDeleteGoal = useCallback(() => {
    Alert.alert('Eliminar meta', '¿Eliminar esta meta y todo su historial?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (selectedGoal) {
            await removeGoal(selectedGoal.id)
            router.back()
          }
        },
      },
    ])
  }, [selectedGoal, removeGoal, router])

  if (!selectedGoal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accentCyan} />
        </View>
      </SafeAreaView>
    )
  }

  const progress = selectedGoal.target_amount > 0
    ? selectedGoal.current_amount / selectedGoal.target_amount
    : 0
  const progressWidth = Math.min(progress * 100, 100)
  const remaining = Math.max(0, selectedGoal.target_amount - selectedGoal.current_amount)
  const isCompleted = progress >= 1

  const now = new Date()
  const monthsRemaining = selectedGoal.deadline
    ? Math.max(0, Math.ceil((new Date(selectedGoal.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : null

  const monthlyNeeded = monthsRemaining && monthsRemaining > 0 && !isCompleted
    ? remaining / monthsRemaining
    : null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron.left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{selectedGoal.name}</Text>
        <Pressable onPress={handleDeleteGoal} style={styles.backButton}>
          <Icon name="exclamationmark.triangle.fill" size={20} color={Colors.danger} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.heroCard}>
          <View style={[styles.goalIcon, { backgroundColor: selectedGoal.color + '20' }]}>
            <Icon name={selectedGoal.icon} size={32} color={selectedGoal.color} />
          </View>
          <Text style={styles.heroAmount}>{formatCurrency(selectedGoal.current_amount)}</Text>
          <Text style={styles.heroTarget}>
            de {formatCurrency(selectedGoal.target_amount)}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressWidth}%`,
                  backgroundColor: isCompleted ? Colors.savings : selectedGoal.color,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressPercent, { color: isCompleted ? Colors.savings : selectedGoal.color }]}>
            {(progress * 100).toFixed(1)}%
          </Text>
        </Card>

        {!isCompleted && (
          <Card style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Falta</Text>
                <Text style={styles.statValue}>{formatCurrency(remaining)}</Text>
              </View>
              {monthsRemaining !== null && (
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Meses restantes</Text>
                  <Text style={styles.statValue}>{monthsRemaining}</Text>
                </View>
              )}
              {monthlyNeeded !== null && (
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Ahorro mensual</Text>
                  <Text style={[styles.statValue, { color: Colors.accentCyan }]}>
                    {formatCurrency(monthlyNeeded)}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {!isCompleted && (
          <Card>
            <Text style={styles.sectionTitle}>Añadir aporte</Text>
            <View style={styles.contributionRow}>
              <TextInput
                style={styles.contributionInput}
                value={contributionAmount}
                onChangeText={setContributionAmount}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor={Colors.textSecondary}
              />
              <Text style={styles.contributionCurrency}>€</Text>
              <Button
                title="Añadir"
                onPress={handleAddContribution}
                disabled={isAdding || !contributionAmount}
                style={styles.contributionButton}
              />
            </View>
          </Card>
        )}

        <Text style={styles.historyTitle}>Historial de aportes</Text>
        {contributions.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Aún no hay aportes registrados</Text>
          </Card>
        ) : (
          <Card style={styles.historyCard}>
            {contributions.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => handleDeleteContribution(c.id)}
                style={styles.contributionItem}
              >
                <View>
                  <Text style={styles.contributionDate}>{formatDate(c.date)}</Text>
                </View>
                <Text style={[styles.contributionAmount, { color: Colors.savings }]}>
                  +{formatCurrency(c.amount)}
                </Text>
              </Pressable>
            ))}
          </Card>
        )}
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
  goalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAmount: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  heroTarget: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  statsCard: {
    padding: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  contributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contributionInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contributionCurrency: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
  contributionButton: {
    minWidth: 100,
  },
  historyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  historyCard: {
    padding: 0,
  },
  contributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contributionDate: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  contributionAmount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: Spacing.lg,
  },
})
