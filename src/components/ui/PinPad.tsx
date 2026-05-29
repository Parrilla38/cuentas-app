import { Pressable, StyleSheet, Text, View } from 'react-native'

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants'

interface PinPadProps {
  pin: string
  maxLength: number
  onDigitPress: (digit: string) => void
  onDelete: () => void
  error?: boolean
}

export function PinPad({ pin, maxLength, onDigitPress, onDelete, error = false }: PinPadProps) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {Array.from({ length: maxLength }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < pin.length && styles.dotFilled, error && styles.dotError]}
          />
        ))}
      </View>

      <View style={styles.grid}>
        {digits.map((digit, i) => {
          if (digit === '') {
            return <View key={i} style={styles.key} />
          }

          if (digit === 'del') {
            return (
              <Pressable
                key={i}
                onPress={onDelete}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              >
                <Text style={styles.keyText}>⌫</Text>
              </Pressable>
            )
          }

          return (
            <Pressable
              key={i}
              onPress={() => onDigitPress(digit)}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
            >
              <Text style={styles.keyText}>{digit}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 320,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
  },
  dotFilled: {
    backgroundColor: Colors.accentCyan,
    borderColor: Colors.accentCyan,
  },
  dotError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keyPressed: {
    backgroundColor: Colors.cardSolid,
    transform: [{ scale: 0.95 }],
  },
  keyText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
  },
})
