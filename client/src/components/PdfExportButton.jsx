import { useState } from 'react';
import Icon from './Icon.jsx';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function monthLabel(row, index, count, asOf = new Date()) {
  if (row.year) return `${row.month} ${row.year}`;

  const lastCompletedMonth = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() - 1, 1));
  const date = new Date(Date.UTC(
    lastCompletedMonth.getUTCFullYear(),
    lastCompletedMonth.getUTCMonth() - (count - index - 1),
    1,
  ));
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export default function PdfExportButton({ profile, months, isSample = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function exportPdf() {
    setBusy(true);
    setError('');
    try {
      const [{ jsPDF }, { autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const reportMonths = (months || []).slice(-12);
      const verificationStatus = profile?.verificationStatus === 'API Verified'
        ? 'API Verified'
        : 'Self-Reported';

      doc.setProperties({
        title: 'Proof of Income',
        subject: '12-month income summary',
        author: 'Gigproof',
      });

      doc.setFillColor(25, 61, 50);
      doc.rect(0, 0, 210, 43, 'F');
      doc.setTextColor(255, 254, 250);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('gigproof.', 17, 15);
      doc.setFontSize(20);
      doc.text('Proof of Income', 17, 27);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(218, 229, 219);
      doc.text('12-month income summary', 17, 35);

      doc.setTextColor(41, 55, 47);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('VERIFICATION STATUS', 17, 55);

      const badgeWidth = verificationStatus === 'API Verified' ? 34 : 37;
      doc.setFillColor(232, 239, 229);
      doc.roundedRect(17, 59, badgeWidth, 9, 2, 2, 'F');
      doc.setTextColor(49, 88, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(verificationStatus, 20, 65);

      if (isSample) {
        doc.setTextColor(122, 91, 43);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Illustrative sample — not for application use', 58, 65);
      }

      doc.setTextColor(92, 105, 95);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('ADJUSTED MONTHLY INCOME', 17, 82);
      doc.text('RELIABILITY SCORE', 111, 82);

      doc.setTextColor(31, 52, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(21);
      doc.text(currency.format(Number(profile?.adjustedMonthlyIncome) || 0), 17, 93);
      doc.text(`${Math.round(Number(profile?.reliabilityScore) || 0)} / 100`, 111, 93);

      doc.setDrawColor(222, 228, 220);
      doc.line(17, 101, 193, 101);
      doc.setTextColor(41, 55, 47);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Monthly payout history', 17, 112);
      doc.setTextColor(101, 113, 104);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Income recorded in each calendar month', 17, 118);

      autoTable(doc, {
        startY: 124,
        head: [['Income month', 'Payouts']],
        body: reportMonths.map((row, index) => [
          monthLabel(row, index, reportMonths.length),
          currency.format(Number(row.total ?? row.amount) || 0),
        ]),
        foot: [[
          '12-month total',
          currency.format(reportMonths.reduce((sum, row) => sum + (Number(row.total ?? row.amount) || 0), 0)),
        ]],
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 3.2, textColor: [51, 67, 56] },
        headStyles: { fillColor: [25, 61, 50], textColor: [255, 254, 250], fontStyle: 'bold' },
        footStyles: { fillColor: [239, 243, 235], textColor: [38, 60, 45], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 245] },
        columnStyles: { 1: { halign: 'right', cellWidth: 48 } },
        margin: { left: 17, right: 17, bottom: 18 },
        didDrawPage: () => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(111, 121, 113);
          doc.text('Prepared with Gigproof · Income figures reflect the records shown above.', 17, 286);
          doc.text(`Page ${doc.internal.getNumberOfPages()}`, 193, 286, { align: 'right' });
        },
      });

      const filename = isSample ? 'gigproof-proof-of-income-sample.pdf' : 'gigproof-proof-of-income.pdf';
      doc.save(filename);
    } catch {
      setError('The PDF could not be generated. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button className="button-secondary pdf-export-button" type="button" onClick={exportPdf} disabled={busy}>
      <Icon name="report" size={16} />
      {busy ? 'Preparing PDF…' : 'Download proof of income'}
    </button>
    <span className="sr-only" role="status" aria-live="polite">{error}</span>
  </>;
}
