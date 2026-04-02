const db = require("../config/db");

exports.setBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, month, year, category = null } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    await db.query(
      `INSERT INTO budgets (user_id, amount, month, year, category)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [userId, amount, month, year, category]
    );

    res.status(201).json({ message: 'Budget set' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    const [result] = await db.query(
      `SELECT * FROM budgets 
       WHERE user_id = ? AND month = ? AND year = ?`,
      [userId, month, year]
    );

    // Separate total budget from category budgets
    const total = result.find(b => b.category === null) || { amount: 0 };
    const byCategory = result.filter(b => b.category !== null);

    res.json({ total, byCategory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

