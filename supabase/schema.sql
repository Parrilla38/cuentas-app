-- ============================================================
-- Cuentas APP - Supabase Schema
-- Ejecutar este script completo en SQL Editor de Supabase
-- ============================================================

-- 1. Tabla profiles (extension de auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  monthly_salary REAL NOT NULL DEFAULT 0,
  savings_percentage REAL NOT NULL DEFAULT 20,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: crear perfil automaticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabla categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  is_fixed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla loans
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('given', 'received')),
  person TEXT NOT NULL,
  principal REAL NOT NULL,
  interest_rate REAL NOT NULL DEFAULT 0,
  term_months INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'paid', 'overdue')),
  amortization_type TEXT NOT NULL DEFAULT 'french' CHECK(amortization_type IN ('french', 'german')),
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabla transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
  tag TEXT,
  recurring_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabla loan_payments
CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  is_interest BOOLEAN NOT NULL DEFAULT false,
  is_principal BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabla budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK(month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  amount REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabla savings_goals
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL DEFAULT 0,
  deadline TEXT,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Tabla contributions
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Tabla recurring_expenses
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  day_of_month INTEGER NOT NULL CHECK(day_of_month >= 1 AND day_of_month <= 31),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Tabla settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  PRIMARY KEY (key, user_id)
);

-- ============================================================
-- INDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_user ON loan_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_goal ON contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user ON settings(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Loans
CREATE POLICY "Users can view own loans" ON loans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loans" ON loans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loans" ON loans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own loans" ON loans FOR DELETE USING (auth.uid() = user_id);

-- Loan Payments
CREATE POLICY "Users can view own loan_payments" ON loan_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loan_payments" ON loan_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loan_payments" ON loan_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own loan_payments" ON loan_payments FOR DELETE USING (auth.uid() = user_id);

-- Budgets
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);

-- Savings Goals
CREATE POLICY "Users can view own savings_goals" ON savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings_goals" ON savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings_goals" ON savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings_goals" ON savings_goals FOR DELETE USING (auth.uid() = user_id);

-- Contributions
CREATE POLICY "Users can view own contributions" ON contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contributions" ON contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contributions" ON contributions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contributions" ON contributions FOR DELETE USING (auth.uid() = user_id);

-- Recurring Expenses
CREATE POLICY "Users can view own recurring_expenses" ON recurring_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recurring_expenses" ON recurring_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring_expenses" ON recurring_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring_expenses" ON recurring_expenses FOR DELETE USING (auth.uid() = user_id);

-- Settings
CREATE POLICY "Users can view own settings" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON settings FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- FUNCIONES RPC para queries complejas
-- ============================================================

CREATE OR REPLACE FUNCTION get_spending_by_category(start_date TEXT, end_date TEXT)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  category_icon TEXT,
  category_color TEXT,
  amount REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.category_id,
    c.name AS category_name,
    c.icon AS category_icon,
    c.color AS category_color,
    SUM(t.amount)::REAL AS amount
  FROM transactions t
  INNER JOIN categories c ON t.category_id = c.id
  WHERE t.user_id = auth.uid()
    AND t.type = 'expense'
    AND t.date >= start_date
    AND t.date < end_date
  GROUP BY t.category_id, c.name, c.icon, c.color
  ORDER BY amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_budgets_with_spending(p_year INTEGER, p_month INTEGER)
RETURNS TABLE (
  id UUID,
  category_id UUID,
  month INTEGER,
  year INTEGER,
  amount REAL,
  category_name TEXT,
  category_icon TEXT,
  category_color TEXT,
  spent REAL,
  percentage REAL
) AS $$
DECLARE
  v_start_date TEXT;
  v_end_date TEXT;
BEGIN
  v_start_date := p_year || '-' || LPAD(p_month::TEXT, 2, '0') || '-01';
  IF p_month = 12 THEN
    v_end_date := (p_year + 1)::TEXT || '-01-01';
  ELSE
    v_end_date := p_year::TEXT || '-' || LPAD((p_month + 1)::TEXT, 2, '0') || '-01';
  END IF;

  RETURN QUERY
  SELECT
    b.id,
    b.category_id,
    b.month,
    b.year,
    b.amount,
    c.name AS category_name,
    c.icon AS category_icon,
    c.color AS category_color,
    COALESCE(SUM(t.amount), 0)::REAL AS spent,
    CASE WHEN b.amount > 0 THEN (COALESCE(SUM(t.amount), 0) / b.amount * 100)::REAL ELSE 0::REAL END AS percentage
  FROM budgets b
  INNER JOIN categories c ON b.category_id = c.id
  LEFT JOIN transactions t ON t.category_id = b.category_id
    AND t.type = 'expense'
    AND t.date >= v_start_date
    AND t.date < v_end_date
    AND t.user_id = auth.uid()
  WHERE b.user_id = auth.uid()
    AND b.year = p_year
    AND b.month = p_month
  GROUP BY b.id, b.category_id, b.month, b.year, b.amount, c.name, c.icon, c.color
  ORDER BY percentage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_upcoming_payments(days_ahead INTEGER)
RETURNS TABLE (
  id UUID,
  amount REAL,
  day_of_month INTEGER,
  description TEXT,
  category_name TEXT,
  category_icon TEXT,
  category_color TEXT
) AS $$
DECLARE
  v_current_day INTEGER;
  v_end_day INTEGER;
  v_current_month INTEGER;
  v_end_month INTEGER;
BEGIN
  v_current_day := EXTRACT(DAY FROM CURRENT_DATE)::INTEGER;
  v_end_day := EXTRACT(DAY FROM CURRENT_DATE + days_ahead * INTERVAL '1 day')::INTEGER;
  v_current_month := EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;
  v_end_month := EXTRACT(MONTH FROM CURRENT_DATE + days_ahead * INTERVAL '1 day')::INTEGER;

  IF v_current_month = v_end_month THEN
    RETURN QUERY
    SELECT
      re.id,
      re.amount,
      re.day_of_month,
      re.description,
      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color
    FROM recurring_expenses re
    INNER JOIN categories c ON re.category_id = c.id
    WHERE re.user_id = auth.uid()
      AND re.active = true
      AND re.day_of_month >= v_current_day
      AND re.day_of_month <= v_end_day
    ORDER BY re.day_of_month ASC;
  ELSE
    RETURN QUERY
    SELECT
      re.id,
      re.amount,
      re.day_of_month,
      re.description,
      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color
    FROM recurring_expenses re
    INNER JOIN categories c ON re.category_id = c.id
    WHERE re.user_id = auth.uid()
      AND re.active = true
      AND (re.day_of_month >= v_current_day OR re.day_of_month <= v_end_day)
    ORDER BY
      CASE WHEN re.day_of_month >= v_current_day THEN 0 ELSE 1 END,
      re.day_of_month ASC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_recurring_expenses_with_category()
RETURNS TABLE (
  id UUID,
  amount REAL,
  day_of_month INTEGER,
  category_id UUID,
  description TEXT,
  active BOOLEAN,
  category_name TEXT,
  category_icon TEXT,
  category_color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    re.id,
    re.amount,
    re.day_of_month,
    re.category_id,
    re.description,
    re.active,
    c.name AS category_name,
    c.icon AS category_icon,
    c.color AS category_color
  FROM recurring_expenses re
  INNER JOIN categories c ON re.category_id = c.id
  WHERE re.user_id = auth.uid()
  ORDER BY re.day_of_month ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_loans_with_summary()
RETURNS TABLE (
  id UUID,
  type TEXT,
  person TEXT,
  principal REAL,
  interest_rate REAL,
  term_months INTEGER,
  start_date TEXT,
  status TEXT,
  amortization_type TEXT,
  description TEXT,
  total_paid REAL,
  total_pending REAL,
  next_payment_date TEXT,
  next_payment_amount REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.type,
    l.person,
    l.principal,
    l.interest_rate,
    l.term_months,
    l.start_date,
    l.status,
    l.amortization_type,
    l.description,
    COALESCE(SUM(CASE WHEN lp.status = 'paid' THEN lp.amount ELSE 0 END), 0)::REAL AS total_paid,
    COALESCE(SUM(CASE WHEN lp.status != 'paid' THEN lp.amount ELSE 0 END), 0)::REAL AS total_pending,
    MIN(CASE WHEN lp.status = 'pending' THEN lp.date END)::TEXT AS next_payment_date,
    (SELECT lp2.amount FROM loan_payments lp2 WHERE lp2.loan_id = l.id AND lp2.status = 'pending' ORDER BY lp2.date ASC LIMIT 1)::REAL AS next_payment_amount
  FROM loans l
  LEFT JOIN loan_payments lp ON lp.loan_id = l.id
  WHERE l.user_id = auth.uid()
  GROUP BY l.id, l.type, l.person, l.principal, l.interest_rate, l.term_months, l.start_date, l.status, l.amortization_type, l.description
  ORDER BY l.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_net_worth()
RETURNS TABLE (total_income REAL, total_expense REAL) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::REAL AS total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::REAL AS total_expense
  FROM transactions
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE loans;
ALTER PUBLICATION supabase_realtime ADD TABLE loan_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE savings_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE recurring_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
