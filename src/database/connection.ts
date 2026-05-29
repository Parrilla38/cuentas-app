import * as SQLite from 'expo-sqlite'
import { isWeb } from '@/lib/platform'
import { createSupabaseAdapter, type SupabaseAdapter } from './supabase-adapter'

const DB_NAME = 'cuentas.db'

let db: SQLite.SQLiteDatabase | SupabaseAdapter | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | SupabaseAdapter> {
  if (!db) {
    if (isWeb) {
      db = createSupabaseAdapter()
    } else {
      db = await SQLite.openDatabaseAsync(DB_NAME)
    }
  }
  return db
}

export async function closeDatabase(): Promise<void> {
  if (db && !isWeb) {
    await (db as SQLite.SQLiteDatabase).closeAsync()
    db = null
  }
}
