const db = require('../config/db');

exports.getTemplates = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM recurring_templates WHERE user_id = ? ORDER BY next_due ASC',
    [req.user.id]
  );
  res.json(rows);
};

exports.addTemplate = async (req, res) => {
  const { category, amount, description, recur_frequency, recur_day } = req.body;
  const userId = req.user.id;

  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  // Calculate first next_due date
  const today = new Date();
  let next_due = new Date(today);

  if (recur_frequency === 'monthly') {
    next_due.setDate(recur_day);
    if (next_due <= today) next_due.setMonth(next_due.getMonth() + 1);
  } else if (recur_frequency === 'weekly') {
    next_due.setDate(today.getDate() + (7 - today.getDay() + recur_day) % 7 || 7);
  } else {
    next_due.setDate(today.getDate() + 1);
  }

  await db.query(
    `INSERT INTO recurring_templates
     (user_id, category, amount, description, recur_frequency, recur_day, next_due)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, category, amount, description, recur_frequency, recur_day,
     next_due.toISOString().split('T')[0]]
  );

  res.status(201).json({ message: 'Recurring template created' });
};

exports.deleteTemplate = async (req, res) => {
  await db.query(
    'DELETE FROM recurring_templates WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  res.json({ message: 'Deleted' });
};
