import { createContext, useContext, useEffect, useState } from 'react'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  onboardingCompleted: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  onboardingCompleted: false,
})

export function useAuth() {
  return useContext(AuthContext)
}

function useAuthInit() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()

        setOnboardingCompleted(profile?.onboarding_completed || false)
      }

      setIsLoading(false)

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user)

          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single()

          setOnboardingCompleted(profile?.onboarding_completed || false)
        } else {
          setUser(null)
          setOnboardingCompleted(false)
        }
      })
    }

    init()
  }, [])

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.replace('/auth/login')
    } else if (!onboardingCompleted) {
      router.replace('/onboarding')
    }
  }, [isLoading, user, onboardingCompleted])

  return { user, isLoading, isAuthenticated: !!user, onboardingCompleted }
}

export { AuthContext, useAuthInit }