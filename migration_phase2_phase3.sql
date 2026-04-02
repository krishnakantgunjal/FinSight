USE expense_db;

-- ============================================================
-- Phase 2 migrations (most already done via your new schema)
-- Run only if upgrading an existing DB, not a fresh install
-- ============================================================

-- Add theme preference to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme ENUM('light','dark') DEFAULT 'light';

-- Add indexes for dashboard query performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_income_user_date   ON income(user_id, date);

-- Reset alert_sent_80 at the start of each month (run via cron or manually)
-- UPDATE budgets SET alert_sent_80 = FALSE WHERE month != MONTH(CURDATE());

-- ============================================================
-- Phase 3 migrations
-- ============================================================

-- Savings goals table
CREATE TABLE IF NOT EXISTS goals (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  name           VARCHAR(100) NOT NULL,
  target_amount  DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  target_date    DATE NOT NULL,
  completed      BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Merchant category mapping table (for CSV import)
CREATE TABLE IF NOT EXISTS merchant_categories (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  keyword  VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority INT DEFAULT 1
);

-- Seed merchant map
INSERT IGNORE INTO merchant_categories (keyword, category) VALUES
  ('swiggy','Food'),('zomato','Food'),('blinkit','Food'),
  ('ola','Transport'),('uber','Transport'),('rapido','Transport'),
  ('netflix','Entertainment'),('spotify','Entertainment'),('hotstar','Entertainment'),
  ('amazon','Shopping'),('flipkart','Shopping'),('myntra','Shopping'),
  ('apollo','Health'),('medplus','Health'),('1mg','Health'),
  ('airtel','Utilities'),('jio','Utilities'),('electricity','Utilities'),
  ('rent','Rent'),('landlord','Rent');

-- Add is_anomaly computed column support index
CREATE INDEX IF NOT EXISTS idx_expenses_user_cat ON expenses(user_id, category, date);

-- Add recurring_id FK to expenses (links expense back to its template)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS recurring_id INT NULL;

-- Drop constraint if it already exists (makes migration safe to re-run)
ALTER TABLE expenses DROP FOREIGN KEY IF EXISTS fk_recurring;
ALTER TABLE expenses ADD CONSTRAINT fk_recurring
  FOREIGN KEY (recurring_id) REFERENCES recurring_templates(id) ON DELETE SET NULL;
