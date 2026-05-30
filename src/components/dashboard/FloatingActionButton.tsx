import { Pressable, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { Colors, Spacing, Shadow } from '@/constants'

export function FloatingActionButton() {
  const router = useRouter()

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push('/transaction/add')}
    >
      <View style={styles.button}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    ...Shadow.large,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
})