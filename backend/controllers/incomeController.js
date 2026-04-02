const db = require("../config/db");

exports.addIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, category, date } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    await db.query("INSERT INTO income (user_id, amount, category, date) VALUES (?, ?, ?, ?)", [userId, amount, category, date]);
    res.status(201).json({ message: "Income added" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [result] = await db.query(
      'SELECT * FROM income WHERE user_id = ? ORDER BY date DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM income WHERE user_id = ?',
      [userId]
    );

    res.json({ data: result, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, category, date } = req.body;

    if (!amount || parseFloat(amount) <= 0)
      return res.status(400).json({ message: 'Amount must be greater than zero' });

    const [result] = await db.query(
      'UPDATE income SET amount = ?, category = ?, date = ? WHERE id = ? AND user_id = ?',
      [amount, category, date, id, userId]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Income record not found' });

    res.json({ message: 'Income updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM income WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Income record not found' });

    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getIncomeByCategory = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT category, SUM(amount) as total FROM income
       WHERE user_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
       GROUP BY category`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


