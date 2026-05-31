import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!client) {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!url || !key) {
      return createFallbackClient()
    }
    client = createClient(url, key)
  }
  return client
}

function createFallbackClient(): SupabaseClient {
  return {
    from: () => ({ select: () => ({ data: [], error: null }), insert: () => ({ error: null }), update: () => ({ eq: () => ({ error: null }) }), delete: () => ({ eq: () => ({ error: null }) }) }),
    auth: { getSession: async () => ({ data: { session: null }, error: null }), signInWithPassword: async () => ({ data: null, error: null }), signUp: async () => ({ data: null, error: null }), signInWithOAuth: async () => ({ data: null, error: null }), signOut: async () => ({ error: null }), resetPasswordForEmail: async () => ({ data: null, error: null }), updateUser: async () => ({ data: null, error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
    rpc: async () => ({ data: null, error: null }),
  } as unknown as SupabaseClient
}

const supabaseClient = {
  auth: {
    getSession: () => getClient().auth.getSession(),
    signInWithPassword: (options: any) => getClient().auth.signInWithPassword(options),
    signUp: (options: any) => getClient().auth.signUp(options),
    signInWithOAuth: (options: any) => getClient().auth.signInWithOAuth(options),
    signOut: () => getClient().auth.signOut(),
    resetPasswordForEmail: (email: string) => getClient().auth.resetPasswordForEmail(email),
    updateUser: (options: any) => getClient().auth.updateUser(options),
    onAuthStateChange: (callback: any) => getClient().auth.onAuthStateChange(callback),
  },
  from: (table: string) => getClient().from(table),
  rpc: (fn: string, params?: any) => getClient().rpc(fn, params),
}

export default supabaseClient
export const supabase = supabaseClient