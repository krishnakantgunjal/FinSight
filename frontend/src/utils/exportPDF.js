import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportExpenseReport(expenses, totals, userName, month) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Expense Report', 14, 20);
  doc.setFontSize(11);
  doc.text(`User: ${userName}`, 14, 30);
  doc.text(`Period: ${month}`, 14, 37);

  doc.setFontSize(12);
  doc.text(`Total Income: ₹${totals.monthlyIncome}`, 14, 50);
  doc.text(`Total Expenses: ₹${totals.totalExpense}`, 14, 58);
  doc.text(`Balance: ₹${totals.balance}`, 14, 66);

  autoTable(doc, {
    startY: 76,
    head: [['Date', 'Category', 'Description', 'Amount']],
    body: expenses.map(e => [new Date(e.date).toLocaleDateString(), e.category, e.description || '—', `₹${e.amount}`]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 110, 247] },
  });

  doc.save(`expense-report-${month}.pdf`);
}
