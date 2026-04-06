const csv = require('csv-parser');
const fs  = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { guessCategory } = require('../utils/merchantMap');
const db = require('../config/db');

function normalizeRow(row) {
  // Normalize common HDFC/SBI/ICICI column names (CSV/XLSX)
  const date =
    row['Date'] ||
    row['Txn Date'] ||
    row['Transaction Date'] ||
    row['Value Date'] ||
    row['TxnDate'];
  const desc =
    row['Description'] ||
    row['Narration'] ||
    row['Transaction Remarks'] ||
    row['Remarks'] ||
    row['Txn Remarks'];
  let debitStr =
    row['Debit'] ||
    row['Withdrawal Amt.'] ||
    row['Debit Amount'] ||
    row['Withdrawal Amount'] ||
    row['Dr Amount'] ||
    '0';

  debitStr = debitStr?.toString?.().replace(/,/g, '') ?? '0';
  const debit = parseFloat(debitStr);
  return { date: date?.toString?.().trim(), desc: desc?.toString?.().trim(), debit };
}

function parseExcelFile(filePath) {
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];
  // defval keeps empty cells as ''
  return xlsx.utils.sheet_to_json(sheet, { defval: '' });
}

exports.previewImport = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const results = [];

  const ext = path.extname(req.file.originalname || req.file.path).toLowerCase();

  try {
    if (ext === '.csv') {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          const { date, desc, debit } = normalizeRow(row);
          if (debit > 0) {
            results.push({
              date,
              description: desc,
              amount: debit,
              category: guessCategory(desc),
              confirmed: false
            });
          }
        })
        .on('end', () => {
          fs.unlinkSync(req.file.path); // clean up
          res.json({ transactions: results, count: results.length });
        })
        .on('error', (err) => {
          try { fs.unlinkSync(req.file.path); } catch (_) {}
          res.status(400).json({ message: 'Could not parse CSV', error: err.message });
        });
      return;
    }

    if (ext === '.xlsx' || ext === '.xls') {
      const rows = parseExcelFile(req.file.path);
      for (const row of rows) {
        const { date, desc, debit } = normalizeRow(row);
        if (debit > 0) {
          results.push({
            date,
            description: desc,
            amount: debit,
            category: guessCategory(desc),
            confirmed: false
          });
        }
      }
      fs.unlinkSync(req.file.path); // clean up
      return res.json({ transactions: results, count: results.length });
    }

    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Unsupported file type' });
  } catch (err) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    return res.status(500).json({ message: 'Could not parse file', error: err.message });
  }
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
