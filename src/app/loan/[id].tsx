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
import { Card } from '@/components/ui/Card'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency, formatDate } from '@/utils/format'
import { useLoansStore } from '@/stores/loans'
import type { LoanPayment } from '@/types'

export default function LoanDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { selectedLoan, payments, loadLoanDetail, markPaymentPaid, removeLoan } = useLoansStore()
  const [activeSection, setActiveSection] = useState<'schedule' | 'info'>('schedule')

  useEffect(() => {
    if (id) loadLoanDetail(id)
  }, [id, loadLoanDetail])

  const handleMarkPaid = useCallback(
    (paymentId: string) => {
      Alert.alert('Confirmar pago', '¿Marcar esta cuota como pagada?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => markPaymentPaid(paymentId) },
      ])
    },
    [markPaymentPaid],
  )

  const handleDelete = useCallback(() => {
    Alert.alert('Eliminar préstamo', '¿Eliminar este préstamo y todo su historial?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (selectedLoan) {
            await removeLoan(selectedLoan.id)
            router.back()
          }
        },
      },
    ])
  }, [selectedLoan, removeLoan, router])

  if (!selectedLoan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accentCyan} />
        </View>
      </SafeAreaView>
    )
  }

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPending = payments
    .filter((p) => p.status !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const paidCount = payments.filter((p) => p.status === 'paid').length
  const progress = payments.length > 0 ? paidCount / payments.length : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return Colors.savings
      case 'overdue': return Colors.danger
      default: return Colors.warning
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado'
      case 'overdue': return 'Vencido'
      default: return 'Pendiente'
    }
  }

  const renderPaymentRow = (payment: LoanPayment) => (
    <Pressable
      key={payment.id}
      onPress={() => payment.status !== 'paid' && handleMarkPaid(payment.id)}
      style={[styles.paymentRow, payment.status === 'paid' && styles.paymentRowPaid]}
    >
      <View style={styles.paymentLeft}>
        <View style={[styles.paymentStatus, { backgroundColor: getStatusColor(payment.status) }]} />
        <View>
          <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
          <Text style={[styles.paymentStatusLabel, { color: getStatusColor(payment.status) }]}>
            {getStatusLabel(payment.status)}
          </Text>
        </View>
      </View>
      <Text style={[styles.paymentAmount, { color: payment.status === 'paid' ? Colors.textSecondary : Colors.textPrimary }]}>
        {formatCurrency(payment.amount)}
      </Text>
    </Pressable>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="chevron.left" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{selectedLoan.person}</Text>
        <Pressable onPress={handleDelete} style={styles.backButton}>
          <Icon name="exclamationmark.triangle.fill" size={20} color={Colors.danger} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            {selectedLoan.type === 'given' ? 'Me deben' : 'Debo'}
          </Text>
          <Text style={styles.heroAmount}>{formatCurrency(selectedLoan.principal)}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Pagado</Text>
              <Text style={[styles.heroStatValue, { color: Colors.savings }]}>
                {formatCurrency(totalPaid)}
              </Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Pendiente</Text>
              <Text style={[styles.heroStatValue, { color: Colors.warning }]}>
                {formatCurrency(totalPending)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {paidCount} de {payments.length} cuotas pagadas
          </Text>
        </Card>

        <View style={styles.sectionToggle}>
          <Pressable
            onPress={() => setActiveSection('schedule')}
            style={[styles.sectionButton, activeSection === 'schedule' && styles.sectionButtonActive]}
          >
            <Text style={[styles.sectionButtonText, activeSection === 'schedule' && styles.sectionButtonTextActive]}>
              Calendario
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveSection('info')}
            style={[styles.sectionButton, activeSection === 'info' && styles.sectionButtonActive]}
          >
            <Text style={[styles.sectionButtonText, activeSection === 'info' && styles.sectionButtonTextActive]}>
              Información
            </Text>
          </Pressable>
        </View>

        {activeSection === 'schedule' ? (
          <Card style={styles.scheduleCard}>
            {payments.length === 0 ? (
              <Text style={styles.emptyText}>No hay cuotas generadas</Text>
            ) : (
              payments.map(renderPaymentRow)
            )}
          </Card>
        ) : (
          <Card>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo</Text>
              <Text style={styles.infoValue}>
                {selectedLoan.type === 'given' ? 'Prestado (me deben)' : 'Recibido (debo)'}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Persona</Text>
              <Text style={styles.infoValue}>{selectedLoan.person}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Interés anual</Text>
              <Text style={styles.infoValue}>{selectedLoan.interest_rate}%</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plazo</Text>
              <Text style={styles.infoValue}>{selectedLoan.term_months} meses</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amortización</Text>
              <Text style={styles.infoValue}>
                {selectedLoan.amortization_type === 'french' ? 'Francesa' : 'Alemana'}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha inicio</Text>
              <Text style={styles.infoValue}>{formatDate(selectedLoan.start_date)}</Text>
            </View>
            {selectedLoan.description ? (
              <>
                <View style={styles.separator} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Notas</Text>
                  <Text style={styles.infoValue}>{selectedLoan.description}</Text>
                </View>
              </>
            ) : null}
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
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  heroLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  heroAmount: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  heroStats: {
    flexDirection: 'row',
    width: '100%',
    marginTop: Spacing.sm,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  heroStatLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  heroStatValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.savings,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  sectionToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  sectionButtonActive: {
    backgroundColor: Colors.accentCyan + '20',
  },
  sectionButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  sectionButtonTextActive: {
    color: Colors.accentCyan,
    fontWeight: FontWeight.semibold,
  },
  scheduleCard: {
    gap: 0,
    padding: 0,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  paymentRowPaid: {
    opacity: 0.6,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  paymentStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentDate: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  paymentStatusLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  paymentAmount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: Spacing.lg,
  },
})
