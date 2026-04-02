const cron = require('node-cron');
const db = require('../config/db');

// Runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Processing recurring expenses...');
  try {
    const today = new Date().toISOString().split('T')[0];

    // Find all templates due today or earlier
    const [templates] = await db.query(
      `SELECT * FROM recurring_templates WHERE next_due <= ?`,
      [today]
    );

    for (const tmpl of templates) {
      // Insert the expense
      await db.query(
        `INSERT INTO expenses (user_id, category, amount, description, date, is_recurring)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [tmpl.user_id, tmpl.category, tmpl.amount, tmpl.description, today]
      );

      // Calculate next due date
      const nextDue = new Date(today);
      if (tmpl.recur_frequency === 'daily')   nextDue.setDate(nextDue.getDate() + 1);
      if (tmpl.recur_frequency === 'weekly')  nextDue.setDate(nextDue.getDate() + 7);
      if (tmpl.recur_frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);

      await db.query(
        `UPDATE recurring_templates SET last_processed = ?, next_due = ? WHERE id = ?`,
        [today, nextDue.toISOString().split('T')[0], tmpl.id]
      );
    }

    console.log(`[CRON] Processed ${templates.length} recurring expenses`);
  } catch (err) {
    console.error('[CRON] Error:', err.message);
  }
});
// Resets budget alerts at start of each month (1st day, 00:01)
cron.schedule('1 0 1 * *', async () => {
  console.log('[CRON] Resetting budget alert flags...');
  try {
    await db.query('UPDATE budgets SET alert_sent_80 = FALSE');
    console.log('[CRON] Budget alert flags reset');
  } catch (err) {
    console.error('[CRON] Reset error:', err.message);
  }
});

module.exports = {};
