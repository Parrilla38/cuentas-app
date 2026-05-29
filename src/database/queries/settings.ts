import { supabase } from '@/lib/supabase'

export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) return null
  return data.value
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key,user_id' })

  if (error) throw error
}

export async function deleteSetting(key: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .delete()
    .eq('key', key)

  if (error) throw error
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')

  if (error) throw error

  return data.reduce(
    (acc, { key, value }) => {
      acc[key] = value
      return acc
    },
    {} as Record<string, string>,
  )
}
