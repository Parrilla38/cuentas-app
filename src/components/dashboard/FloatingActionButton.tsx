import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'

import { Icon } from '@/components/ui/Icon'
import { Colors, Spacing } from '@/constants'

export function FloatingActionButton() {
  const router = useRouter()

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push('/transaction/add')}
    >
      <LinearGradient
        colors={[Colors.accentCyan, Colors.accentViolet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Icon name="plus" size={28} color={Colors.textPrimary} />
      </LinearGradient>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.accentCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  gradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
})
