const csv = require('csv-parser');
const fs  = require('fs');
const { guessCategory } = require('../utils/merchantMap');
const db = require('../config/db');

exports.previewImport = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      // Normalise HDFC/SBI/ICICI column names
      const date   = row['Date'] || row['Txn Date'] || row['Transaction Date'];
      const desc   = row['Description'] || row['Narration'] || row['Transaction Remarks'];
      let debitStr = row['Debit'] || row['Withdrawal Amt.'] || row['Debit Amount'] || "0";
      debitStr = debitStr.toString().replace(/,/g, '');
      const debit  = parseFloat(debitStr);

      if (debit > 0) {
        results.push({
          date: date?.trim(),
          description: desc?.trim(),
          amount: debit,
          category: guessCategory(desc),
          confirmed: false,
        });
      }
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path); // clean up
      res.json({ transactions: results, count: results.length });
    });
};

exports.confirmImport = async (req, res) => {
  try {
    const { transactions } = req.body;
    const userId = req.user.id;
    let imported = 0;

    for (const t of transactions) {
      if (!t.skip) {
        // Parse date for MySQL (usually YYYY-MM-DD from DD/MM/YYYY or DD-MM-YYYY)
        let formattedDate = t.date;
        if (t.date && t.date.includes('/')) {
            const parts = t.date.split('/');
            if (parts.length === 3) {
                formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        } else if (t.date && t.date.includes('-')) {
            const parts = t.date.split('-');
            if (parts[0].length === 2 && parts.length === 3) {
                 formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        await db.query(
          'INSERT INTO expenses (user_id, category, amount, description, date) VALUES (?,?,?,?,?)',
          [userId, t.category, t.amount, t.description, formattedDate]
        );
        imported++;
      }
    }
    res.json({ message: `Imported ${imported} transactions` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
