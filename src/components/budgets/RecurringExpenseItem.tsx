import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'
import { formatCurrency } from '@/utils/format'

interface RecurringExpenseItemProps {
  id: string
  amount: number
  day_of_month: number
  description: string
  category_name: string
  category_icon: string
  category_color: string
  active: boolean
  onPress?: () => void
  onToggle?: () => void
}

export function RecurringExpenseItem({
  amount,
  day_of_month,
  description,
  category_name,
  category_icon,
  category_color,
  active,
  onPress,
  onToggle,
}: RecurringExpenseItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, !active && styles.inactive, pressed && styles.pressed]}
    >
      <View style={[styles.iconContainer, { backgroundColor: category_color + '20' }]}>
        <Icon name={category_icon} size={20} color={active ? category_color : Colors.textSecondary} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, !active && styles.nameInactive]} numberOfLines={1}>
          {description || category_name}
        </Text>
        <Text style={styles.date}>Día {day_of_month} de cada mes</Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, !active && styles.amountInactive]}>
          {formatCurrency(amount)}
        </Text>
        <Pressable onPress={onToggle} hitSlop={8} style={styles.toggle}>
          <View style={[styles.toggleTrack, active && styles.toggleTrackActive]}>
            <View style={[styles.toggleKnob, active && styles.toggleKnobActive]} />
          </View>
        </Pressable>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  inactive: {
    opacity: 0.5,
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
  nameInactive: {
    color: Colors.textSecondary,
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  amount: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  amountInactive: {
    color: Colors.textSecondary,
  },
  toggle: {
    padding: 2,
  },
  toggleTrack: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: Colors.savings,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  pressed: {
    opacity: 0.8,
  },
})
