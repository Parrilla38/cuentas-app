import { useEffect, useRef } from 'react'
import { AppState } from 'react-native'

import { isWeb } from '@/lib/platform'

export function useAppLock() {
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    if (isWeb) return

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [])
}
