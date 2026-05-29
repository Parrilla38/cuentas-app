export interface DefaultCategory {
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
  sort_order: number
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Alimentación', icon: 'fork.knife', color: '#F97316', type: 'expense', sort_order: 1 },
  { name: 'Alquiler', icon: 'house.fill', color: '#EF4444', type: 'expense', sort_order: 2 },
  { name: 'Transporte', icon: 'car.fill', color: '#3B82F6', type: 'expense', sort_order: 3 },
  { name: 'Electricidad', icon: 'bolt.fill', color: '#F59E0B', type: 'expense', sort_order: 4 },
  { name: 'Agua', icon: 'drop.fill', color: '#06B6D4', type: 'expense', sort_order: 5 },
  { name: 'Internet', icon: 'wifi', color: '#8B5CF6', type: 'expense', sort_order: 6 },
  { name: 'Seguros', icon: 'shield.lefthalf.filled', color: '#10B981', type: 'expense', sort_order: 7 },
  { name: 'Salud', icon: 'cross.case.fill', color: '#EC4899', type: 'expense', sort_order: 8 },
  { name: 'Ocio', icon: 'gamecontroller.fill', color: '#A78BFA', type: 'expense', sort_order: 9 },
  { name: 'Ropa', icon: 'bag.fill', color: '#F43F5E', type: 'expense', sort_order: 10 },
  { name: 'Educación', icon: 'book.fill', color: '#6366F1', type: 'expense', sort_order: 11 },
  { name: 'Suscripciones', icon: 'star.fill', color: '#8B5CF6', type: 'expense', sort_order: 12 },
  { name: 'Gimnasio', icon: 'dumbbell.fill', color: '#14B8A6', type: 'expense', sort_order: 13 },
  { name: 'Restaurantes', icon: 'fork.knife.circle.fill', color: '#FB923C', type: 'expense', sort_order: 14 },
  { name: 'Otros', icon: 'ellipsis.circle.fill', color: '#64748B', type: 'expense', sort_order: 15 },
  { name: 'Salario', icon: 'dollarsign.circle.fill', color: '#10B981', type: 'income', sort_order: 1 },
  { name: 'Freelance', icon: 'laptopcomputer', color: '#6366F1', type: 'income', sort_order: 2 },
  { name: 'Bonos', icon: 'gift.fill', color: '#F59E0B', type: 'income', sort_order: 3 },
  { name: 'Inversiones', icon: 'chart.line.uptrend.xyaxis', color: '#22D3EE', type: 'income', sort_order: 4 },
  { name: 'Otros ingresos', icon: 'arrow.down.circle.fill', color: '#64748B', type: 'income', sort_order: 5 },
]

export interface FixedExpenseOption {
  name: string
  icon: string
  defaultSelected: boolean
}

export const FIXED_EXPENSE_OPTIONS: FixedExpenseOption[] = [
  { name: 'Alquiler', icon: 'house.fill', defaultSelected: true },
  { name: 'Electricidad', icon: 'bolt.fill', defaultSelected: true },
  { name: 'Agua', icon: 'drop.fill', defaultSelected: true },
  { name: 'Internet', icon: 'wifi', defaultSelected: true },
  { name: 'Seguros', icon: 'shield.lefthalf.filled', defaultSelected: true },
  { name: 'Suscripciones', icon: 'star.fill', defaultSelected: false },
  { name: 'Gimnasio', icon: 'dumbbell.fill', defaultSelected: false },
  { name: 'Transporte', icon: 'car.fill', defaultSelected: false },
]
