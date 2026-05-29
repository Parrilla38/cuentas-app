import { StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency } from '@/utils/format'
import type { UpcomingPayment } from '@/database/queries'

interface UpcomingPaymentsProps {
  payments: UpcomingPayment[]
}

export function UpcomingPayments({ payments }: UpcomingPaymentsProps) {
  if (payments.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Próximos pagos</Text>
      <View style={styles.list}>
        {payments.slice(0, 4).map((payment) => (
          <View key={payment.id} style={styles.item}>
            <View style={[styles.iconContainer, { backgroundColor: payment.category_color + '20' }]}>
              <Icon
                name={payment.category_icon}
                size={20}
                color={payment.category_color}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {payment.description || payment.category_name}
              </Text>
              <Text style={styles.date}>Día {payment.day_of_month}</Text>
            </View>
            <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  list: {
    gap: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
})
