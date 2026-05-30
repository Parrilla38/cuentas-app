import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  onboardingCompleted: boolean
  monthlySalary: number
  savingsPercentage: number
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  authenticate: () => void
  lock: () => void
  completeOnboarding: (salary: number, savingsPercentage: number) => Promise<void>
  setMonthlySalary: (salary: number) => Promise<void>
  setSavingsPercentage: (percentage: number) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  onboardingCompleted: false,
  monthlySalary: 0,
  savingsPercentage: 20,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({
          user: session.user,
          session,
          isLoading: false,
          isAuthenticated: true,
          onboardingCompleted: profile?.onboarding_completed || false,
          monthlySalary: profile?.monthly_salary || 0,
          savingsPercentage: profile?.savings_percentage || 20,
        })
      } else {
        set({
          isLoading: false,
          isAuthenticated: false,
        })
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({
            user: session.user,
            session,
            isAuthenticated: true,
            onboardingCompleted: profile?.onboarding_completed || false,
            monthlySalary: profile?.monthly_salary || 0,
            savingsPercentage: profile?.savings_percentage || 20,
          })
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            onboardingCompleted: false,
          })
        }
      })
    } catch {
      set({ isLoading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://cuentas-app-eta.vercel.app/auth/callback',
      },
    })
    if (error) throw error
  },

  signUp: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  authenticate: () => {
    set({ isAuthenticated: true })
  },

  lock: () => {
    set({ isAuthenticated: false })
  },

  completeOnboarding: async (salary: number, savingsPercentage: number) => {
    const { user } = get()
    if (!user) throw new Error('No user authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        monthly_salary: salary,
        savings_percentage: savingsPercentage,
      })
      .eq('id', user.id)

    if (error) throw error

    set({
      onboardingCompleted: true,
      monthlySalary: salary,
      savingsPercentage,
    })
  },

  setMonthlySalary: async (salary: number) => {
    const { user } = get()
    if (!user) throw new Error('No user authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ monthly_salary: salary })
      .eq('id', user.id)

    if (error) throw error

    set({ monthlySalary: salary })
  },

  setSavingsPercentage: async (percentage: number) => {
    const { user } = get()
    if (!user) throw new Error('No user authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ savings_percentage: percentage })
      .eq('id', user.id)

    if (error) throw error

    set({ savingsPercentage: percentage })
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },
}))
