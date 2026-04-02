const db = require("../config/db");




exports.getComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear  = now.getFullYear();
    const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    const lastYear  = thisMonth === 1 ? thisYear - 1 : thisYear;

    const [rows] = await db.query(
      `SELECT category,
         SUM(CASE WHEN MONTH(date)=? AND YEAR(date)=? THEN amount ELSE 0 END) AS this_month,
         SUM(CASE WHEN MONTH(date)=? AND YEAR(date)=? THEN amount ELSE 0 END) AS last_month
       FROM expenses WHERE user_id = ?
       AND date >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH)
       GROUP BY category ORDER BY this_month DESC`,
      [thisMonth, thisYear, lastMonth, lastYear, userId]
    );

    const result = rows.map(r => ({
      category: r.category,
      this_month: parseFloat(r.this_month),
      last_month: parseFloat(r.last_month),
      delta: parseFloat(r.this_month) - parseFloat(r.last_month),
      delta_pct: r.last_month > 0
        ? ((r.this_month - r.last_month) / r.last_month * 100).toFixed(1)
        : (r.this_month > 0 ? "100" : "0"),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [[{ totalIncomeAllTime }]] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as totalIncomeAllTime FROM income WHERE user_id = ?",
      [userId]
    );

    const [[{ monthlyIncome }]] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as monthlyIncome FROM income
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, currentMonth, currentYear]
    );

    const [[{ totalExpense }]] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as totalExpense FROM expenses WHERE user_id = ?",
      [userId]
    );

    const [ [{ currentMonthExpense }] ] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as currentMonthExpense FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?",
      [userId, currentMonth, currentYear]
    );

    const balance = monthlyIncome - currentMonthExpense;

    const [budgets] = await db.query(
      "SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?",
      [userId, currentMonth, currentYear]
    );

    const totalBudgetRecord = budgets.find(b => b.category === null);
    const budgetAmount = totalBudgetRecord ? totalBudgetRecord.amount : 0;

    const categoryBudgets = await Promise.all(
      budgets
        .filter(b => b.category !== null)
        .map(async (b) => {
          const [[{ spent }]] = await db.query(
            "SELECT COALESCE(SUM(amount), 0) as spent FROM expenses WHERE user_id = ? AND category = ? AND MONTH(date) = ? AND YEAR(date) = ?",
            [userId, b.category, currentMonth, currentYear]
          );
          return {
            category: b.category,
            budget: b.amount,
            spent: parseFloat(spent)
          };
        })
    );

    const [categoryData] = await db.query(
      "SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category",
      [userId]
    );

    const [incomeCategoryData] = await db.query(
      `SELECT category, SUM(amount) as total FROM income 
       WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE()) 
       GROUP BY category`,
      [userId]
    );

    const [monthlyTrend] = await db.query(
      "SELECT MONTHNAME(date) as month, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY MONTH(date), MONTHNAME(date) ORDER BY MONTH(date)",
      [userId]
    );


    const [recentMonths] = await db.query(
      "SELECT SUM(amount) as total, MONTH(date) as month FROM expenses WHERE user_id = ? GROUP BY MONTH(date) ORDER BY month DESC LIMIT 3",
      [userId]
    );
    const prediction =
      recentMonths.length > 0 ? recentMonths.reduce((a, b) => a + parseFloat(b.total), 0) / recentMonths.length : 0;

    res.json({
      totals: { 
        totalIncome: totalIncomeAllTime, 
        monthlyIncome,
        totalExpense, 
        balance 
      },
      budget: { 
        budgetAmount, 
        currentMonthExpense, 
        budgetPercent: budgetAmount > 0 ? (currentMonthExpense / budgetAmount) * 100 : 0,
        categoryBudgets
      },
      charts: { categoryData, monthlyTrend, incomeCategoryData },
      prediction,
    });


  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
