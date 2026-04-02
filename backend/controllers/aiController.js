const db = require('../config/db');
const { OpenAI } = require('openai');

exports.getAIAdvice = async (req, res) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const userId = req.user.id;

    // Check cache first — only call OpenAI once per day
    const [cached] = await db.query(
      `SELECT advice, last_updated FROM ai_advice_cache
       WHERE user_id = ? AND DATE(last_updated) = CURDATE()`,
      [userId]
    );

    if (cached.length > 0) return res.json({ advice: cached[0].advice, cached: true });

    // Fetch last 30 days of expenses
    const [expenses] = await db.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM expenses WHERE user_id = ?
       AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY category ORDER BY total DESC`,
      [userId]
    );

    // Fetch monthly budget
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const [[budget]] = await db.query(
      `SELECT amount FROM budgets WHERE user_id = ? AND month = ? AND year = ? AND category IS NULL`,
      [userId, month, year]
    );

    // Local "AI" logic
    let highestCategoryStr = 'No spending yet.';
    if (expenses.length > 0) {
      highestCategoryStr = `Your highest spending category is ${expenses[0].category} at Rs.${parseFloat(expenses[0].total).toFixed(0)}. Consider cutting back here.`;
    }

    // Unusual expense detection
    let unusualStr = '';
    const [recentExpenses] = await db.query(
      `SELECT category, amount FROM expenses WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`, [userId]
    );
    if (recentExpenses.length > 0 && expenses.length > 0) {
      const avgMap = {};
      expenses.forEach(e => avgMap[e.category] = parseFloat(e.total)/e.count);
      const unusual = recentExpenses.find(e => parseFloat(e.amount) > 2 * (avgMap[e.category] || 0));
      if (unusual) {
        unusualStr = `\nUnusual expense detected: Rs.${parseFloat(unusual.amount).toFixed(0)} in ${unusual.category}.`;
      } else {
        unusualStr = `\nNo unusual expenses recently.`;
      }
    }

    const advice = `1. ${highestCategoryStr}\n2. ${unusualStr || 'Keep tracking your expenses to get unusual expense alerts.'}`;

    // Save to cache (INSERT or UPDATE)
    await db.query(
      `INSERT INTO ai_advice_cache (user_id, advice) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE advice = VALUES(advice), last_updated = NOW()`,
      [userId, advice]
    );

    res.json({ advice, cached: false });
  } catch (error) {
    res.status(500).json({ message: 'AI advice failed', error: error.message });
  }
};
