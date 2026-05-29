export const SCHEMA_VERSION = 1

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  is_fixed INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  category_id TEXT NOT NULL,
  description TEXT DEFAULT '',
  loan_id TEXT,
  tag TEXT,
  recurring_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (loan_id) REFERENCES loans(id),
  FOREIGN KEY (recurring_id) REFERENCES recurring_expenses(id)
);

CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('given', 'received')),
  person TEXT NOT NULL,
  principal REAL NOT NULL,
  interest_rate REAL NOT NULL DEFAULT 0,
  term_months INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'paid', 'overdue')),
  amortization_type TEXT NOT NULL DEFAULT 'french' CHECK(amortization_type IN ('french', 'german')),
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS loan_payments (
  id TEXT PRIMARY KEY,
  loan_id TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  is_interest INTEGER NOT NULL DEFAULT 0,
  is_principal INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue')),
  FOREIGN KEY (loan_id) REFERENCES loans(id)
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  month INTEGER NOT NULL CHECK(month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  amount REAL NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL DEFAULT 0,
  deadline TEXT,
  color TEXT NOT NULL,
  icon TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES savings_goals(id)
);

CREATE TABLE IF NOT EXISTS recurring_expenses (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  day_of_month INTEGER NOT NULL CHECK(day_of_month >= 1 AND day_of_month <= 31),
  category_id TEXT NOT NULL,
  description TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_contributions_goal ON contributions(goal_id);
`
