import { supabase } from '@/lib/supabase'

export interface SupabaseAdapter {
  getAllAsync<T>(query: string, params?: any[]): Promise<T[]>
  getFirstAsync<T>(query: string, params?: any[]): Promise<T | undefined>
  runAsync(query: string, params?: any[]): Promise<void>
  execAsync(query: string): Promise<void>
}

export function createSupabaseAdapter(): SupabaseAdapter {
  return {
    async getAllAsync<T>(query: string, params?: any[]): Promise<T[]> {
      const result = await supabase.rpc(extractRpcFunctionName(query), params?.[0] || {})
      if (result.error) throw result.error
      return result.data as T[]
    },

    async getFirstAsync<T>(query: string, params?: any[]): Promise<T | undefined> {
      const result = await supabase.rpc(extractRpcFunctionName(query), params?.[0] || {})
      if (result.error) throw result.error
      return (result.data as T[])?.[0]
    },

    async runAsync(query: string, params?: any[]): Promise<void> {
      const { table, operation } = parseQuery(query)
      
      if (operation === 'insert') {
        const data = buildInsertData(query, params)
        const result = await supabase.from(table).insert(data)
        if (result.error) throw result.error
      } else if (operation === 'update') {
        const { data, id } = buildUpdateData(query, params)
        const result = await supabase.from(table).update(data).eq('id', id)
        if (result.error) throw result.error
      } else if (operation === 'delete') {
        const id = params?.[params.length - 1]
        const result = await supabase.from(table).delete().eq('id', id)
        if (result.error) throw result.error
      }
    },

    async execAsync(query: string): Promise<void> {
      if (query.includes('DELETE FROM')) {
        const table = extractTableFromDelete(query)
        const result = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        if (result.error) throw result.error
      }
    },
  }
}

function extractRpcFunctionName(query: string): string {
  const match = query.match(/SELECT\s+\*\s+FROM\s+(\w+)/i)
  if (match) return match[1]
  return query
}

function parseQuery(query: string): { table: string; operation: 'insert' | 'update' | 'delete' } {
  if (query.includes('INSERT INTO')) {
    const match = query.match(/INSERT INTO (\w+)/i)
    return { table: match?.[1] || '', operation: 'insert' }
  }
  if (query.includes('UPDATE')) {
    const match = query.match(/UPDATE (\w+)/i)
    return { table: match?.[1] || '', operation: 'update' }
  }
  if (query.includes('DELETE FROM')) {
    const match = query.match(/DELETE FROM (\w+)/i)
    return { table: match?.[1] || '', operation: 'delete' }
  }
  return { table: '', operation: 'insert' }
}

function buildInsertData(query: string, params?: any[]): any {
  const columnsMatch = query.match(/\(([^)]+)\)\s+VALUES/i)
  if (!columnsMatch || !params) return {}
  
  const columns = columnsMatch[1].split(',').map(c => c.trim())
  const data: any = {}
  columns.forEach((col, i) => {
    data[col] = params[i]
  })
  return data
}

function buildUpdateData(query: string, params?: any[]): { data: any; id: string } {
  const setMatch = query.match(/SET\s+(.+?)\s+WHERE/i)
  if (!setMatch || !params) return { data: {}, id: '' }
  
  const setClause = setMatch[1]
  const fields = setClause.split(',').map(f => f.trim().split('=')[0].trim())
  
  const data: any = {}
  fields.forEach((field, i) => {
    data[field] = params[i]
  })
  
  const id = params[params.length - 1]
  return { data, id }
}

function extractTableFromDelete(query: string): string {
  const match = query.match(/DELETE FROM (\w+)/i)
  return match?.[1] || ''
}
