import { Ionicons } from '@expo/vector-icons'
import type { ColorValue } from 'react-native'

interface IconProps {
  name: string
  size?: number
  color?: ColorValue
}

const SYMBOL_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'house.fill': 'home',
  'arrow.triangle.2.circlepath': 'sync',
  'hand.raised.fill': 'hand-left',
  'chart.pie.fill': 'pie-chart',
  'chart.bar.fill': 'bar-chart',
  'plus': 'add',
  'exclamationmark.triangle.fill': 'warning',
  'lock.fill': 'lock-closed',
  'faceid': 'scan',
  'eurosign.circle.fill': 'logo-euro',
  'target': 'locate',
  'repeat.circle.fill': 'repeat',
  'checkmark': 'checkmark',
  'lock.shield.fill': 'shield-checkmark',
  'checkmark.circle.fill': 'checkmark-circle',
  'chevron.left': 'chevron-back',
  'fork.knife': 'restaurant',
  'car.fill': 'car',
  'bolt.fill': 'flash',
  'drop.fill': 'water',
  'wifi': 'wifi',
  'shield.lefthalf.filled': 'shield',
  'cross.case.fill': 'medkit',
  'gamecontroller.fill': 'game-controller',
  'bag.fill': 'bag',
  'book.fill': 'book',
  'star.fill': 'star',
  'dumbbell.fill': 'barbell',
  'fork.knife.circle.fill': 'restaurant',
  'ellipsis.circle.fill': 'ellipsis-horizontal-circle',
  'dollarsign.circle.fill': 'cash',
  'laptopcomputer': 'laptop',
  'gift.fill': 'gift',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'arrow.down.circle.fill': 'arrow-down-circle',
  'book.outline': 'book-outline',
}

export function Icon({ name, size = 24, color = '#000' }: IconProps) {
  const iconName = SYMBOL_MAP[name] || 'ellipse'
  return <Ionicons name={iconName} size={size} color={color} />
}
