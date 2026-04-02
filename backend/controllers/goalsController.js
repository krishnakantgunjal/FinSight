const db = require('../config/db');

exports.getGoals = async (req, res) => {
  try {
    const [goals] = await db.query(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY target_date ASC',
      [req.user.id]
    );

    // Add projected completion date to each goal
    const [[{ monthly_savings }]] = await db.query(
      `SELECT COALESCE(
         (SELECT SUM(i.amount) FROM income i WHERE i.user_id=? AND MONTH(i.date)=MONTH(CURDATE()) AND YEAR(i.date)=YEAR(CURDATE()))
         - (SELECT SUM(e.amount) FROM expenses e WHERE e.user_id=? AND MONTH(e.date)=MONTH(CURDATE()) AND YEAR(e.date)=YEAR(CURDATE())),
       0) as monthly_savings`,
      [req.user.id, req.user.id]
    );

    const enriched = goals.map(g => {
      const remaining = parseFloat(g.target_amount) - parseFloat(g.current_amount);
      const savings = parseFloat(monthly_savings);
      
      const months = savings > 0 ? Math.ceil(remaining / savings) : null;
      const projected = months ? new Date(Date.now() + months * 30 * 86400000) : null;
      
      return { 
        ...g, 
        monthly_savings: savings, 
        projected_completion: projected 
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addGoal = async (req, res) => {
  try {
    const { name, target_amount, target_date } = req.body;

    if (!target_amount || parseFloat(target_amount) <= 0) {
      return res.status(400).json({ message: "Invalid target amount" });
    }

    await db.query(
      'INSERT INTO goals (user_id, name, target_amount, target_date) VALUES (?,?,?,?)',
      [req.user.id, name, target_amount, target_date]
    );
    res.status(201).json({ message: 'Goal created' });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateGoalAmount = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    await db.query(
      'UPDATE goals SET current_amount = current_amount + ? WHERE id = ? AND user_id = ?',
      [amount, req.params.id, req.user.id]
    );
    res.json({ message: 'Goal updated' });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    await db.query('DELETE FROM goals WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
