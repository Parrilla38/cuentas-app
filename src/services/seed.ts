import { v4 as uuid } from 'uuid'

import { DEFAULT_CATEGORIES } from '@/constants/categories'
import { supabase } from '@/lib/supabase'

export async function seedDefaultCategories(fixedExpenseNames: string[]): Promise<void> {
  const { data: existing, error } = await supabase
    .from('categories')
    .select('id')
    .limit(1)

  if (error) throw error
  if (existing && existing.length > 0) return

  const categoriesToInsert = DEFAULT_CATEGORIES.map((cat) => ({
    id: uuid(),
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    type: cat.type,
    is_fixed: cat.type === 'expense' && fixedExpenseNames.includes(cat.name),
    sort_order: cat.sort_order,
  }))

  const { error: insertError } = await supabase
    .from('categories')
    .insert(categoriesToInsert)

  if (insertError) throw insertError
}
