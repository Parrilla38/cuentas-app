import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'

import { Colors } from '@/constants/colors'
import { isWeb } from '@/lib/platform'

export default function LockScreen() {
  const router = useRouter()

  useEffect(() => {
    if (isWeb) {
      router.replace('/auth/login' as any)
    }
  }, [router])

  return <View style={styles.container} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
})
