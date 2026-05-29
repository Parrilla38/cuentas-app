import { getDatabase } from './connection'
import { CREATE_TABLES_SQL, SCHEMA_VERSION } from './schema'

export async function runMigrations(): Promise<void> {
  const db = await getDatabase()

  await db.execAsync(CREATE_TABLES_SQL)

  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    ['schema_version'],
  )

  if (!result) {
    await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', [
      'schema_version',
      String(SCHEMA_VERSION),
    ])
  }
}

export async function getSchemaVersion(): Promise<number> {
  const db = await getDatabase()
  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    ['schema_version'],
  )
  return result ? parseInt(result.value, 10) : 0
}
