# Cuentas APP — Plan Maestro

> Documento de referencia para la construcción del proyecto. Toda decisión de diseño, arquitectura y funcionalidad debe consultarse aquí antes de implementar.

---

## 1. Decisiones Fundamentales

| Decisión | Opción elegida |
|----------|---------------|
| Plataforma | Web + Móvil (React Native + Expo) |
| Almacenamiento | Local (SQLite) + Backup cifrado en nube (Google Drive / iCloud) |
| Moneda principal | EUR (€) |
| Complejidad | Avanzada tipo pro |
| Estilo visual | Atractivo, moderno, intuitivo (glassmorphism, gradientes) |
| Idioma de la interfaz | Solo español |
| Backup | Google Drive / iCloud (JSON cifrado con AES-256) |
| Seguridad | PIN (4-6 dígitos) + biometría + SQLCipher |
| Sincronización entre dispositivos | No (solo backup, no sync en tiempo real) |

---

## 2. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework | React Native + Expo (SDK 52+) | Un solo codebase para web, iOS y Android |
| Lenguaje | TypeScript | Tipado seguro, menor bugs |
| Navegación | Expo Router (file-based) | Navegación tipada y declarativa |
| Base de datos | expo-sqlite (local) + SQLCipher | Local, rápida, cifrada |
| Estado | Zustand con persist middleware | Ligero, simple, sin boilerplate |
| Gráficos | Victory Native | Funciona en móvil y web |
| Autenticación | expo-local-authentication | PIN + biometría nativa |
| Backup | Google Drive API / iCloud | Exportar JSON cifrado |
| Exportación | react-native-share | Generación PDF/CSV |
| Animaciones | Lottie | Celebraciones al cumplir metas |

---

## 3. Principios de Diseño Visual (OBLIGATORIO)

- Fondo principal: modo oscuro por defecto
- **Glassmorphism** con blur en tarjetas del dashboard
- Gradientes suaves: azul→púrpura para ingresos, rojo→naranja para gastos
- Esquinas redondeadas: `borderRadius: 16-20` en cards
- Iconos outlined con colores vivos
- Animaciones sutiles (Lottie para celebraciones)
- Tipografía: System font con pesos variados (300-700)
- Espaciado generoso, nada amontonado
- Acentos neón sobre fondo oscuro
- Colores semáforo para presupuestos: verde→amarillo→rojo
- Barra de salud financiera con score visual (0-100)

### Paleta de colores base
- Ingresos: gradiente azul→púrpura `#6366F1 → #8B5CF6`
- Gastos: gradiente rojo→naranja `#EF4444 → #F97316`
- Ahorro: verde `#10B981`
- Fondo principal: `#0F172A` (dark slate)
- Cards: `rgba(255,255,255,0.08)` con blur
- Texto principal: `#F8FAFC`
- Texto secundario: `#94A3B8`
- Acentos: neón cyan `#22D3EE`, neón violeta `#A78BFA`

---

## 4. Estructura de Carpetas

```
cuentas-app/
├── app/                          # Expo Router - pantallas
│   ├── (tabs)/                   # Navegación principal con tabs
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── index.tsx             # Dashboard
│   │   ├── transactions.tsx      # Lista transacciones
│   │   ├── loans.tsx             # Préstamos
│   │   ├── budgets.tsx           # Presupuestos
│   │   └── reports.tsx           # Reportes
│   ├── transaction/
│   │   ├── add.tsx               # Añadir transacción
│   │   └── [id].tsx              # Detalle transacción
│   ├── loan/
│   │   ├── add.tsx               # Nuevo préstamo
│   │   └── [id].tsx              # Detalle préstamo + amortización
│   ├── savings/
│   │   ├── index.tsx             # Metas de ahorro
│   │   ├── add.tsx               # Nueva meta
│   │   └── [id].tsx              # Detalle meta
│   ├── tools/
│   │   ├── index.tsx             # Calculadoras
│   │   ├── loan-calc.tsx         # Calc préstamo
│   │   └── compound.tsx          # Calc interés compuesto
│   ├── settings.tsx
│   ├── onboarding.tsx
│   ├── lock-screen.tsx            # PIN/biometría
│   └── _layout.tsx               # Root layout
├── src/
│   ├── components/               # Componentes reusables
│   │   ├── ui/                   # Botones, inputs, cards
│   │   ├── charts/               # Gráficos encapsulados
│   │   └── shared/               # Headers, listas, etc.
│   ├── hooks/                    # Custom hooks
│   ├── stores/                   # Zustand stores
│   ├── database/                 # SQLite schema + queries
│   │   ├── schema.ts
│   │   ├── migrations.ts
│   │   └── queries/              # CRUD por entidad
│   ├── services/                 # Lógica de negocio
│   │   ├── advice-engine.ts      # Motor de consejos
│   │   ├── loan-calculator.ts    # Amortización
│   │   ├── budget-analyzer.ts
│   │   └── backup.ts             # Backup en nube
│   ├── utils/                    # Helpers, formateo
│   ├── constants/                # Colores, iconos, textos
│   └── types/                    # TypeScript interfaces
├── assets/                       # Iconos, fuentes, animaciones
├── app.json
├── package.json
└── tsconfig.json
```

---

## 5. Modelo de Datos (SQLite)

### Tabla: transactions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | TEXT (PK) | UUID |
| type | TEXT | 'income' o 'expense' |
| amount | REAL | Cantidad en EUR |
| date | TEXT | ISO date |
| category_id | TEXT (FK) | Referencia a categories |
| description | TEXT | Notas del usuario |
| loan_id | TEXT (FK) | Referencia a loans (nullable) |
| tag | TEXT | Etiqueta flexible (nullable) |
| recurring_id | TEXT (FK) | Referencia a recurring_exp (nullable) |
| created_at | TEXT | ISO datetime |

### Tabla: categories
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | TEXT (PK) | UUID |
| name | TEXT | Nombre de la categoría |
| icon | TEXT | Nombre del icono |
| color | TEXT | Color hex |
| type | TEXT | 'income' o 'expense' |
| is_fixed | BOOLEAN | Gasto fijo mensual |
| sort_order | INTEGER | Orden de visualización |

### Tabla: loans
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | TEXT (PK) | UUID |
| type | TEXT | 'given' (me deben) o 'received' (debo) |
| person | TEXT | Nombre de la persona |
| principal | REAL | Capital del préstamo |
| interest_rate | REAL | Tasa de interés anual (%) |
| term_months | INTEGER | Plazo en meses |
| start_date | TEXT | Fecha inicio (ISO date) |
| status | TEXT | 'active', 'paid', 'overdue' |
| amortization_type | TEXT | 'french' o 'german' |
| description | TEXT | Notas |

### Tabla: loan_payments
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | TEXT (PK) | UUID |
| loan_id | TEXT (FK) | Referencia a loans |
| amount | REAL | Cantidad del pago |
| date | TEXT | ISO date |
| is_interest | BOOLEAN | Es parte de interés |
| is_principal | BOOLEAN | Es parte de capital |
| status | TEXT | 'pending', 'paid', 'overdue' |

### Tabla: budgets
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | TEXT (PK) | UUID |
| category_id | TEXT (FK) | Referencia a categories |
| month | INTEGER | Mes (1-12) |
| year | INTEGER | Año |
| amount | REAL | Presupuesto en EUR |

### Tabla: savings_goals
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | TEXT (PK) | UUID |
| name | TEXT | Nombre de la meta |
| target_amount | REAL | Objetivo en EUR |
| current_amount | REAL | Ahorrado hasta ahora |
| deadline | TEXT | Fecha objetivo (ISO date, nullable) |
| color | TEXT | Color hex |
| icon | TEXT | Icono |

### Tabla: contributions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | TEXT (PK) | UUID |
| goal_id | TEXT (FK) | Referencia a savings_goals |
| amount | REAL | Cantidad aportada |
| date | TEXT | ISO date |

### Tabla: recurring_expenses
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | TEXT (PK) | UUID |
| amount | REAL | Cantidad |
| day_of_month | INTEGER | Día del mes |
| category_id | TEXT (FK) | Referencia a categories |
| description | TEXT | Descripción |
| active | BOOLEAN | Activo o no |

### Tabla: settings
| Campo | Tipo | Descripción |
|-------|------|-------------|
| key | TEXT (PK) | Clave del setting |
| value | TEXT | Valor serializado |

### Relaciones
- transactions.category_id → categories.id
- transactions.loan_id → loans.id
- transactions.recurring_id → recurring_expenses.id
- loan_payments.loan_id → loans.id
- budgets.category_id → categories.id
- contributions.goal_id → savings_goals.id
- recurring_expenses.category_id → categories.id

---

## 6. Módulos Funcionales Detallados

### 6.1 Dashboard Principal
- Tarjeta hero: ingresos, gastos, ahorro neto del mes
- Donut chart: distribución de gastos por categoría
- Barra de salud financiera (score 0-100)
- Widget: próximos pagos de la semana
- Widget: progreso de meta de ahorro activa
- Alertas si algún presupuesto está al 80%+
- Acceso rápido a añadir transacción (FAB)

### 6.2 Ingresos
- Salario mensual recurrente (auto-registro cada mes)
- Ingresos extras (freelance, bonos, regalos)
- Histórico y proyección anual
- Categorías personalizables de ingresos

### 6.3 Gastos
- Categorías personalizables con iconos y colores
- Gastos fijos mensuales (alquiler, seguros, suscripciones)
- Gastos variables (comida, transporte, ocio)
- Registro rápido con atajos
- Etiquetas/tags flexibles
- Detección automática de gastos recurrentes
- Agrupación por día en la lista
- Swipe para eliminar, tap para detalle

### 6.4 Préstamos y Deudas
- Vista dual: "Me deben" / "Debo"
- Progreso visual por préstamo
- Cuota siguiente y total pendiente
- Tabla de amortización completa (francesa/alemana)
- Cálculo de intereses automáticos
- Calendario de cuotas con estado: pagada/pendiente/vencida
- Historial de pagos por préstamo
- Indicador de estado: al día / vencida / saldada

### 6.5 Presupuestos
- Presupuesto por categoría y mes
- Plantilla sugerida: regla 50/30/20 (customizable)
- Alertas al 70%, 90%, 100%
- Comparativa real vs. presupuestado
- Presupuesto "libre": lo que queda sin asignar
- Colores semáforo (verde→amarillo→rojo)

### 6.6 Metas de Ahorro
- Fondo de emergencia (3-6 meses de gastos)
- Metas personalizadas (vacaciones, coche, boda)
- Progreso visual con barras
- Aportes recurrentes o puntuales
- Cálculo de cuánto ahorrar por mes para llegar a tiempo
- Celebración con animación Lottie al cumplir meta

### 6.7 Consejos Inteligentes (basados en reglas, sin IA)
1. Ratio ahorro < 20% → "Intenta ahorrar al menos el 20% de tus ingresos"
2. Categoría sube > 30% vs. mes anterior → "Tu gasto en X subió un Y% este mes"
3. Suscripciones > 15% de ingresos → "Revisa tus suscripciones, representan un X%"
4. Sin fondo de emergencia → "Crea un fondo de emergencia de 3-6 meses"
5. Préstamo vencido → "Tienes un pago vencido en el préstamo de X"
6. Presupuesto al 90% → "Te acercas al límite de tu presupuesto en X"
7. Oportunidad de ahorro → "Si reduces X un 10%, ahorrarías Y€ al año"
8. Celebración → "¡Llevas 3 meses seguidos ahorrando más del 20%!"
9. Gasto inusual → "Este gasto de X€ es un 200% mayor a tu media en esta categoría"
10. Ingreso extra → "Has recibido ingresos extras este mes, ¿quieres destinarlos a ahorro?"

### 6.8 Reportes y Análisis
- Tabs: Semanal | Mensual | Trimestral | Anual
- Gráfico de barras: ingresos vs gastos por mes
- Línea de tendencia de ahorro
- Top 5 categorías de gasto
- Comparativa vs. mes anterior (% cambio)
- Patrimonio neto (activos - pasivos)
- Exportar a PDF/CSV

### 6.9 Herramientas / Calculadoras
- Calculadora de préstamos: capital, tasa, plazo → cuota, intereses totales, tabla
- Interés compuesto: capital inicial, aportación mensual, años → resultado
- Divisor de gastos compartidos: introducir gastos y personas → quién paga qué
- Regla del 50/30/20: calcula según tu sueldo
- Planificador simple de retiro

---

## 7. Flujo de Pantallas

```
Onboarding → Salario, moneda, categorías base, PIN
    │
    ▼
Lock Screen (PIN + biometría)
    │
    ▼
Dashboard (pantalla principal)
    ├── [+] Añadir transacción (FAB)
    │       ├── Tipo: Ingreso / Gasto
    │       ├── Categoría (selector visual)
    │       ├── Cantidad
    │       ├── Fecha
    │       ├── Descripción
    │       └── Tag
    ├── Tab: Transacciones → Lista + filtros + búsqueda
    ├── Tab: Préstamos → Lista → Detalle (amortización)
    ├── Tab: Presupuestos → Mes actual → Editar
    ├── Tab: Ahorros → Metas → Detalle + aportar
    ├── Tab: Reportes → Gráficos → Exportar
    ├── Herramientas → Calculadoras
    └── Ajustes → Categorías, moneda, tema, backup, seguridad
```

---

## 8. Onboarding (primera vez)

1. Pantalla bienvenida con estilo visual impactante
2. Salario mensual → "¿Cuánto ganas al mes?"
3. Gastos fijos → "¿Cuáles son tus gastos fijos?" (pre-seleccionados: alquiler, luz, agua, internet, seguro)
4. Objetivo ahorro → "¿Cuánto quieres ahorrar al mes?"
5. Seguridad → Configurar PIN de 4-6 dígitos + activar biometría
6. Dashboard → listo para usar

---

## 9. Seguridad (OBLIGATORIO)

- **Lock screen**: PIN de 4-6 dígitos + opción biometría (huella/face)
- **Cifrado en reposo**: SQLite con SQLCipher
- **Backup cifrado**: JSON exportado con AES-256 antes de subir a Google Drive
- **No hay datos en servidor**: todo queda cifrado en dispositivo + backup
- **No se envían datos a terceros**: la app es 100% local
- **Timeout de sesión**: requerir PIN tras 5 minutos de inactividad

---

## 10. Reglas y Restricciones (NO HACER)

- **NO** añadir sincronización en tiempo real entre dispositivos (solo backup)
- **NO** usar servicios de IA externos para consejos (solo reglas locales)
- **NO** añadir autenticación con email/password/social login (solo PIN local)
- **NO** mostrar publicidad ni modelo freemium
- **NO** recopilar datos personales ni analíticas de uso
- **NO** soportar multi-moneda en esta versión (solo EUR)
- **NO** internacionalizar en esta versión (solo español)
- **NO** usar comentarios en el código (clean code, que el código hable)
- **NO** añadir funcionalidades que no estén en este documento sin consultar primero
- **NO** usar librerías no listadas en el stack sin justificación

---

## 11. Fases de Desarrollo

| Fase | Contenido | Tiempo est. |
|------|-----------|-------------|
| **F0** | Setup del proyecto: Expo + TypeScript + SQLite + navegación base + ESLint + Prettier | 2-3 días |
| **F1** | Lock screen (PIN + biometría) + Onboarding completo | 3-4 días |
| **F2** | Database schema + migraciones + CRUD transacciones/categorías | 3-4 días |
| **F3** | Dashboard con widgets + gráficos | 4-5 días |
| **F4** | Gastos recurrentes + Presupuestos + Alertas | 3-4 días |
| **F5** | Préstamos + Amortización + Calendario pagos | 4-5 días |
| **F6** | Metas de ahorro + Contribuciones | 2-3 días |
| **F7** | Reportes + Exportación PDF/CSV | 3-4 días |
| **F8** | Motor de consejos (reglas) + Herramientas/Calculadoras | 3-4 días |
| **F9** | Backup cifrado en Google Drive | 3-4 días |
| **F10** | Pulido UI, animaciones, testing multi-plataforma | 4-5 días |

**Total estimado: 5-7 semanas**

---

## 12. Criterios de Calidad

- Toda pantalla debe cargar en < 500ms
- Toda acción del usuario debe tener feedback visual inmediato
- Los gráficos deben ser interactivos (tap para ver detalle)
- La app debe funcionar 100% offline
- Los tests unitarios cubriendo servicios y calculadoras
- Tests de integración para flujos críticos (CRUD transacciones, préstamos)
- Accesibilidad: contrastes WCAG AA, labels en iconos

---

## 13. Notas Adicionales

- La moneda es EUR (€) con formato europeo: 1.234,56 €
- Las fechas se muestran en formato DD/MM/YYYY
- El día de la semana inicia en lunes (convención europea)
- Los decimales usan coma (convención europea)
- Los miles usan punto (convención europea)
- Primer día del mes = día de reset de presupuestos y gastos recurrentes