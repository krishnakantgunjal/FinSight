import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportExpenseReport(expenses, totals, userName, month) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;

  // Some built-in PDF fonts don't support the ₹ glyph well; use "Rs." for clean output.
  const formatINR = (value) => {
    const num = Number(value);
    const safe = Number.isFinite(num) ? num : 0;
    return `Rs.${safe.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const safeText = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

  doc.setCharSpace(0);
  doc.setTextColor(20, 24, 38);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Expense Report', marginX, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`User: ${safeText(userName)}`, marginX, 30);
  doc.text(`Period: ${safeText(month)}`, marginX, 37);

  // Summary block (left labels, right aligned values)
  doc.setTextColor(20, 24, 38);
  doc.setFontSize(12);
  const labelX = marginX;
  const valueX = pageWidth - marginX;
  const summaryY = 52;
  const rowGap = 8;

  doc.setFont('helvetica', 'normal');
  doc.text('Total Income', labelX, summaryY);
  doc.text(formatINR(totals?.monthlyIncome), valueX, summaryY, { align: 'right' });

  doc.text('Total Expenses', labelX, summaryY + rowGap);
  doc.text(formatINR(totals?.totalExpense), valueX, summaryY + rowGap, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('Balance', labelX, summaryY + rowGap * 2);
  doc.text(formatINR(totals?.balance), valueX, summaryY + rowGap * 2, { align: 'right' });

  autoTable(doc, {
    startY: summaryY + rowGap * 2 + 12,
    head: [['Date', 'Category', 'Description', 'Amount']],
    body: (expenses || []).map((e) => ([
      e?.date ? new Date(e.date).toLocaleDateString('en-GB') : '—',
      safeText(e?.category),
      safeText(e?.description),
      formatINR(e?.amount)
    ])),
    theme: 'striped',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: [30, 41, 59],
      cellPadding: 3
    },
    headStyles: {
      fillColor: [79, 110, 247],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 26 }, // date
      1: { cellWidth: 34 }, // category
      2: { cellWidth: 'auto' }, // description
      3: { cellWidth: 30, halign: 'right' } // amount
    },
    didParseCell: (data) => {
      // Right-align Amount column for all body rows.
      if (data.section === 'body' && data.column.index === 3) {
        data.cell.styles.halign = 'right';
      }
    }
  });

  const safeMonthForFilename = String(month || 'report')
    .replace(/[\\/:*?"<>|]/g, '-')
    .trim();
  doc.save(`expense-report-${safeMonthForFilename}.pdf`);
}
