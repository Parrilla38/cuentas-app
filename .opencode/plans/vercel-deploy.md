# Plan de Migración: SQLite → Supabase + Vercel

## Contexto

La app Cuentas APP es una aplicación React Native (Expo) que actualmente almacena todos los datos localmente en SQLite. El objetivo es migrar a Supabase (PostgreSQL) para que los datos se sincronicen en tiempo real entre dispositivos (ordenador e iPhone via web). La autenticacion pasa de PIN local a email/password con Supabase Auth. Se mantiene la capacidad de usar SQLite local para futuro desarrollo nativo.

**Credenciales Supabase:**
- URL: `https://zgkkgwprhpynedqbnvhc.supabase.co`
- Anon Key: `sb_publishable_qLzOGAPxUU7dgKy2cIRj_w_mT4Iuexv`

---

## Paso 1: Instalar dependencias

**Archivo modificado:** `package.json`

```bash
npm install @supabase/supabase-js
```

---

## Paso 2: Crear schema SQL para Supabase

**Archivo nuevo:** `supabase/schema.sql`

Script SQL completo que el usuario copiara y pegara en el SQL Editor de Supabase. Incluye:

- Tabla `profiles` (extension de `auth.users` con `user_id` como FK)
- Todas las tablas existentes con columna `user_id` aniadida
- Row Level Security (RLS) activado en todas las tablas
- Politicas: cada usuario solo ve/edita sus propios datos
- Indices optimizados
- Trigger para crear perfil automaticamente al registrarse
- Realtime habilitado en las tablas principales

**Diferencias clave vs schema SQLite actual:**
- Columna `user_id UUID REFERENCES auth.users(id)` en todas las tablas
- `is_fixed`, `active`, `is_interest`, `is_principal` pasan de `INTEGER` a `BOOLEAN`
- Timestamps con `TIMESTAMPTZ` en lugar de `TEXT`

---

## Paso 3: Crear cliente Supabase

**Archivo nuevo:** `src/lib/supabase.ts`

- Inicializa `createClient` de `@supabase/supabase-js`
- Lee `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Exporta el cliente singleton `supabase`

**Archivo nuevo:** `src/lib/platform.ts`

- Exporta `isWeb: boolean` (detecta `Platform.OS === 'web'`)
- Exporta `isNative: boolean`

---

## Paso 4: Crear adapter de base de datos

**Archivo nuevo:** `src/database/supabase-adapter.ts`

Implementa la misma API que las queries actuales pero usando Supabase. Funciones helper que mapean las operaciones SQL a llamadas del cliente Supabase JS.

**Archivo modificado:** `src/database/connection.ts`

- Exporta `getDatabase()` que:
  - En web: retorna el adapter de Supabase
  - En native: retorna SQLite (comportamiento actual)

---

## Paso 5: Refactorizar queries (9 archivos)

Cada archivo de queries se reescribe para usar el adapter. La API publica (nombres de funciones, tipos de retorno) se mantiene identica para que los stores no necesiten cambios.

### Archivos a modificar:
- `src/database/queries/transactions.ts`
- `src/database/queries/categories.ts`
- `src/database/queries/loans.ts`
- `src/database/queries/contributions.ts`
- `src/database/queries/budgets.ts`
- `src/database/queries/savings-goals.ts`
- `src/database/queries/recurring-expenses.ts`
- `src/database/queries/settings.ts`
- `src/database/queries/index.ts` (actualizar exports si necesario)

### Patron general de cambio:
```typescript
// ANTES (SQLite):
const db = await getDatabase()
const results = await db.getAllAsync<Transaction>('SELECT * FROM transactions WHERE ...', [params])

// DESPUES (Supabase adapter):
const results = await sbSelect('transactions', { filters: {...}, orderBy: {...} })
```

Para queries complejas con JOINs (getBudgetsWithSpending, getSpendingByCategory, getUpcomingPayments, getRecurringExpensesWithCategory, getAllLoansWithSummary) se usara `supabase.rpc()` con funciones SQL creadas en el schema, o se haran queries manuales via el adapter.

---

## Paso 6: Refactorizar servicios que usan `getDatabase()` directamente

### `src/services/seed.ts`
- Usa `db.getFirstAsync` y `db.runAsync` directamente
- Refactorizar para usar las queries de categories o el adapter

### `src/services/recurring-generator.ts`
- Usa `db.getAllAsync` y `db.runAsync` directamente
- Refactorizar para usar queries de transactions y recurring-expenses

### `src/services/report-generator.ts`
- Usa `db.getFirstAsync` para queries de patrimonio neto
- Refactorizar para usar el adapter de Supabase

### `src/services/backup.ts`
- Usa `db.execAsync` para DELETE masivo y `db.runAsync` para INSERTs
- Refactorizar para usar las queries o el adapter
- Reemplazar `Share` de react-native por Web Share API en web

---

## Paso 7: Autenticacion con Supabase

### `src/stores/auth.ts` (modificar)
- Aniadir estado de sesion Supabase (`user`, `session`)
- `initialize()` -> verificar sesion Supabase existente
- `signIn(email, password)` -> `supabase.auth.signInWithPassword()`
- `signUp(email, password)` -> `supabase.auth.signUp()`
- `signOut()` -> `supabase.auth.signOut()`
- Mantener `monthlySalary`, `savingsPercentage` como datos de perfil en Supabase

### `src/app/auth/login.tsx` (nuevo)
- Pantalla de login con email + password
- Disenio consistente con la app (dark mode, glassmorphism)
- Link a registro y recuperacion de contrasenia

### `src/app/auth/register.tsx` (nuevo)
- Pantalla de registro con email + password + confirmacion

### `src/app/auth/forgot-password.tsx` (nuevo)
- Pantalla de recuperacion de contrasenia

### `src/app/_layout.tsx` (modificar)
- Flujo: no autenticado -> `/auth/login`
- Autenticado pero sin onboarding -> `/onboarding`
- Autenticado + onboarding -> `/(tabs)`
- Suscribirse a `onAuthStateChange` de Supabase

### `src/app/onboarding.tsx` (modificar)
- Eliminar paso de PIN/biometria (paso 4 actual)
- Mantener pasos: bienvenida, salario, gastos fijos, ahorro

### `src/app/lock-screen.tsx` (modificar)
- En web: redirigir a login si no hay sesion

---

## Paso 8: Sincronizacion en tiempo real

### Stores a modificar:
- `src/stores/dashboard.ts`
- `src/stores/transactions.ts`
- `src/stores/loans.ts`
- `src/stores/budgets.ts`
- `src/stores/savings.ts`

### Patron de suscripcion:
```typescript
const channel = supabase
  .channel('transactions-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
    get().loadData()
  })
  .subscribe()
```

Cada store se suscribe a las tablas relevantes y recarga datos cuando detecta cambios.

---

## Paso 9: Compatibilidad web

### `src/services/backup.ts`
- En web: usar `navigator.share()` o fallback a descarga de archivo

### `src/app/settings.tsx`
- En web: ocultar biometria, mostrar "Cerrar sesion" en lugar de "Bloquear app"

### `src/app/onboarding.tsx`
- En web: saltar paso de biometria

### `src/hooks/useAppLock.ts`
- En web: no aplicar timeout de bloqueo

---

## Paso 10: Configuracion Vercel

### `vercel.json` (nuevo)
```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### `.env.local` (nuevo, no commiteado)
```
EXPO_PUBLIC_SUPABASE_URL=https://zgkkgwprhpynedqbnvhc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qLzOGAPxUU7dgKy2cIRj_w_mT4Iuexv
```

### `.gitignore` (modificar)
- Aniadir `.env.local`

---

## Paso 11: Verificacion

1. `npm run typecheck` -> sin errores
2. `npm run lint` -> sin errores
3. `npm run web` -> la app arranca en localhost
4. Login/registro funciona
5. CRUD de transacciones funciona
6. Abrir en dos pestanias -> cambios se reflejan en tiempo real
7. Deploy a Vercel -> funciona en produccion

---

## Resumen de archivos

### Archivos nuevos (8)
| Archivo | Descripcion |
|---------|-------------|
| `supabase/schema.sql` | Schema SQL para Supabase con RLS |
| `src/lib/supabase.ts` | Cliente Supabase singleton |
| `src/lib/platform.ts` | Helpers de deteccion de plataforma |
| `src/database/supabase-adapter.ts` | Adapter que unifica SQLite/Supabase |
| `src/app/auth/login.tsx` | Pantalla de login |
| `src/app/auth/register.tsx` | Pantalla de registro |
| `src/app/auth/forgot-password.tsx` | Recuperar contrasenia |
| `vercel.json` | Configuracion de build para Vercel |

### Archivos modificados (~20)
| Archivo | Cambios |
|---------|---------|
| `package.json` | Aniadir `@supabase/supabase-js` |
| `.gitignore` | Aniadir `.env.local` |
| `src/database/connection.ts` | Detectar plataforma, retornar adapter o SQLite |
| `src/database/queries/transactions.ts` | Usar adapter |
| `src/database/queries/categories.ts` | Usar adapter |
| `src/database/queries/loans.ts` | Usar adapter |
| `src/database/queries/contributions.ts` | Usar adapter |
| `src/database/queries/budgets.ts` | Usar adapter |
| `src/database/queries/savings-goals.ts` | Usar adapter |
| `src/database/queries/recurring-expenses.ts` | Usar adapter |
| `src/database/queries/settings.ts` | Usar adapter |
| `src/stores/auth.ts` | Integrar Supabase Auth |
| `src/stores/dashboard.ts` | Aniadir realtime subscriptions |
| `src/stores/transactions.ts` | Aniadir realtime |
| `src/stores/loans.ts` | Aniadir realtime |
| `src/stores/budgets.ts` | Aniadir realtime |
| `src/stores/savings.ts` | Aniadir realtime |
| `src/app/_layout.tsx` | Flujo de auth con Supabase |
| `src/app/onboarding.tsx` | Quitar paso PIN/biometria |
| `src/app/lock-screen.tsx` | Adaptar para web |
| `src/app/settings.tsx` | Adaptar para web, aniadir cuenta |
| `src/hooks/useAppLock.ts` | Deshabilitar en web |
| `src/services/seed.ts` | Usar adapter |
| `src/services/recurring-generator.ts` | Usar adapter |
| `src/services/report-generator.ts` | Usar adapter |
| `src/services/backup.ts` | Web Share API + adapter |

### Archivos sin cambios
- `src/stores/reports.ts`
- `src/services/loan-calculator.ts`
- `src/services/advice-engine.ts`
- `src/services/budget-analyzer.ts`
- `src/services/health-score.ts`
- Todos los componentes UI y de dashboard
- Todas las constantes y utils

---

## Orden de implementacion

1. **Paso 1-3:** Dependencias + schema SQL + cliente Supabase
2. **Paso 4:** Adapter de base de datos
3. **Paso 5-6:** Refactorizar queries y servicios
4. **Paso 7:** Auth con Supabase (login/register/layout)
5. **Paso 8:** Realtime subscriptions
6. **Paso 9:** Compatibilidad web
7. **Paso 10:** Configuracion Vercel
8. **Paso 11:** Verificacion (typecheck + lint + testing manual)
