const db = require("../config/db");

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, from, to, amount, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Compute 3-month average per category for this user
    const [averages] = await db.query(
      `SELECT category, AVG(monthly_total) as avg_monthly
       FROM (
         SELECT category, MONTH(date) as m, YEAR(date) as y, SUM(amount) as monthly_total
         FROM expenses
         WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
         GROUP BY category, MONTH(date), YEAR(date)
       ) sub GROUP BY category`,
      [userId]
    );

    const avgMap = {};
    averages.forEach(a => avgMap[a.category] = parseFloat(a.avg_monthly));

    let whereClause = "WHERE user_id = ?";
    let params = [userId];

    if (category) {
      whereClause += " AND category = ?";
      params.push(category);
    }
    if (from && to) {
      whereClause += " AND date BETWEEN ? AND ?";
      params.push(from, to);
    }

    if (search) {
      whereClause += " AND (description LIKE ? OR category LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (amount) {
      whereClause += " AND amount <= ?";
      params.push(amount);
    }

    const [expenses] = await db.query(
      `SELECT * FROM expenses ${whereClause} ORDER BY date DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Tag anomalies
    const tagged = expenses.map(e => ({
      ...e,
      is_anomaly: avgMap[e.category] ? (parseFloat(e.amount) > 2 * avgMap[e.category]) : false,
      avg_for_category: avgMap[e.category] || null,
    }));

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM expenses ${whereClause}`,
      params
    );

    res.json({
      data: tagged,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const [categories] = await db.query(
      "SELECT DISTINCT category FROM expenses WHERE user_id = ? ORDER BY category ASC",
      [userId]
    );
    res.json(categories.map((c) => c.category));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addExpense = async (req, res) => {
  const { category, amount, description, date, customCategory, isRecurring, recurFrequency } = req.body;
  const userId = req.user.id;


  if (!amount || parseFloat(amount) <= 0)
    return res.status(400).json({ message: 'Amount must be greater than zero' });

  if (new Date(date) > new Date())
    return res.status(400).json({ message: 'Date cannot be in the future' });

  try {
    // Backend validation for custom category
    if (category === "Other" && !customCategory) {
      return res.status(400).json({ message: "Custom category required" });
    }

    const finalCategory = category === "Other" ? customCategory : category;

    const [result] = await db.query(
      "INSERT INTO expenses (user_id, category, amount, description, date, is_recurring) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, finalCategory, amount, description, date, isRecurring || false]
    );

    // If recurring, create template
    if (isRecurring) {
        let nextDue = new Date(date);
        let recurDay = nextDue.getDate(); // day of month for monthly
        if (recurFrequency === 'daily') {
            nextDue.setDate(nextDue.getDate() + 1);
        } else if (recurFrequency === 'weekly') {
            nextDue.setDate(nextDue.getDate() + 7);
            recurDay = nextDue.getDay(); // day of week
        } else if (recurFrequency === 'monthly') {
            nextDue.setMonth(nextDue.getMonth() + 1);
            recurDay = nextDue.getDate();
        }

        await db.query(
            "INSERT INTO recurring_templates (user_id, category, amount, description, recur_frequency, recur_day, next_due) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, finalCategory, amount, description, recurFrequency, recurDay, nextDue.toISOString().split('T')[0]]
        );
    }


    // BUDGET ALERT LOGIC
    (async () => {
      try {
        const currentMonth = new Date(date).getMonth() + 1;
        const currentYear = new Date(date).getFullYear();

        // 1. Check Overall Budget
        const [[overallBudget]] = await db.query(
          "SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ? AND category IS NULL",
          [userId, currentMonth, currentYear]
        );

        if (overallBudget && !overallBudget.alert_sent_80) {
          const [[{ totalSpent }]] = await db.query(
            "SELECT COALESCE(SUM(amount), 0) as totalSpent FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?",
            [userId, currentMonth, currentYear]
          );

          if (totalSpent / overallBudget.amount >= 0.8) {
            const [[user]] = await db.query("SELECT email, name FROM users WHERE id = ?", [userId]);
            const { sendBudgetAlert } = require("../utils/mailer");
            await sendBudgetAlert(user.email, user.name, totalSpent, null);
            await db.query("UPDATE budgets SET alert_sent_80 = TRUE WHERE id = ?", [overallBudget.id]);
          }
        }

        // 2. Check Category Budget
        const [[categoryBudget]] = await db.query(
          "SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ? AND category = ?",
          [userId, currentMonth, currentYear, finalCategory]
        );

        if (categoryBudget && !categoryBudget.alert_sent_80) {
          const [[{ catSpent }]] = await db.query(
            "SELECT COALESCE(SUM(amount), 0) as catSpent FROM expenses WHERE user_id = ? AND category = ? AND MONTH(date) = ? AND YEAR(date) = ?",
            [userId, finalCategory, currentMonth, currentYear]
          );

          if (catSpent / categoryBudget.amount >= 0.8) {
             const [[user]] = await db.query("SELECT email, name FROM users WHERE id = ?", [userId]);
             const { sendBudgetAlert } = require("../utils/mailer");
             await sendBudgetAlert(user.email, user.name, catSpent, finalCategory);
             await db.query("UPDATE budgets SET alert_sent_80 = TRUE WHERE id = ?", [categoryBudget.id]);
          }
        }
      } catch (err) {
        console.error("Budget alert logic error:", err.message);
      }
    })();


    res.status(201).json({ message: "Expense added", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { category, amount, description, date } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const [result] = await db.query(
      "UPDATE expenses SET category = ?, amount = ?, description = ?, date = ? WHERE id = ? AND user_id = ?",
      [category, amount, description, date, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    res.json({ message: "Expense updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM expenses WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
