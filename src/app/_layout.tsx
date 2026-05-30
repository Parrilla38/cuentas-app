import { Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'

import { Colors } from '@/constants/colors'
import { useAppLock } from '@/hooks/useAppLock'
import { useAuthStore } from '@/stores/auth'
import { generateRecurringTransactions } from '@/services/recurring-generator'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()
  const isLoading = useAuthStore((s) => s.isLoading)
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    async function init() {
      try {
        await initialize()
      } finally {
        setIsReady(true)
        await SplashScreen.hideAsync()
      }
    }
    init()
  }, [initialize])

  useEffect(() => {
    if (!isReady || isLoading) return

    if (!isAuthenticated) {
      router.replace('/auth/login' as any)
    } else if (!onboardingCompleted) {
      router.replace('/onboarding')
    } else {
      generateRecurringTransactions().catch(() => {})
    }
  }, [isReady, isLoading, onboardingCompleted, isAuthenticated, router])

  useAppLock()

  if (!isReady || isLoading) {
    return <View style={styles.loading} />
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
  },
})
