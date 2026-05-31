import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function createSupabaseClient(): SupabaseClient {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!url || !key) {
    const mockClient = {
      from: () => ({ select: () => ({ data: [], error: null }), insert: () => ({ error: null }), update: () => ({ eq: () => ({ error: null }) }), delete: () => ({ eq: () => ({ error: null }) }) }),
      auth: { 
        getSession: async () => ({ data: { session: null }, error: null }), 
        signInWithPassword: async () => ({ data: null, error: null }), 
        signUp: async () => ({ data: null, error: null }), 
        signInWithOAuth: async () => ({ data: null, error: null }), 
        signOut: async () => ({ error: null }), 
        resetPasswordForEmail: async () => ({ data: null, error: null }), 
        updateUser: async () => ({ data: null, error: null }), 
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) 
      },
      rpc: async () => ({ data: null, error: null }),
    } as unknown as SupabaseClient
    return mockClient
  }
  
  return createClient(url, key)
}

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

export const supabase = {
  from: (table: string) => getSupabase().from(table),
  auth: {
    getSession: () => getSupabase().auth.getSession(),
    signInWithPassword: (options: any) => getSupabase().auth.signInWithPassword(options),
    signUp: (options: any) => getSupabase().auth.signUp(options),
    signInWithOAuth: (options: any) => getSupabase().auth.signInWithOAuth(options),
    signOut: () => getSupabase().auth.signOut(),
    resetPasswordForEmail: (email: string) => getSupabase().auth.resetPasswordForEmail(email),
    updateUser: (options: any) => getSupabase().auth.updateUser(options),
    onAuthStateChange: (callback: any) => getSupabase().auth.onAuthStateChange(callback),
  },
  rpc: (fn: string, params?: any) => getSupabase().rpc(fn, params),
}