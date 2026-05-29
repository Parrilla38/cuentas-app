import { v4 as uuid } from 'uuid'

import { supabase } from '@/lib/supabase'
import type { Category, TransactionType } from '@/types'

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data.map(mapCategory)
}

export async function getCategoriesByType(type: TransactionType): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data.map(mapCategory)
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return mapCategory(data)
}

export async function createCategory(
  data: Omit<Category, 'id'>,
): Promise<Category> {
  const category: Category = {
    id: uuid(),
    ...data,
  }

  const { error } = await supabase
    .from('categories')
    .insert({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      is_fixed: category.is_fixed,
      sort_order: category.sort_order,
    })

  if (error) throw error
  return category
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, 'id'>>,
): Promise<void> {
  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.color !== undefined) updateData.color = data.color
  if (data.type !== undefined) updateData.type = data.type
  if (data.is_fixed !== undefined) updateData.is_fixed = data.is_fixed
  if (data.sort_order !== undefined) updateData.sort_order = data.sort_order

  if (Object.keys(updateData).length === 0) return

  const { error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)

  if (error) throw error
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    type: row.type,
    is_fixed: Boolean(row.is_fixed),
    sort_order: row.sort_order,
  }
}
