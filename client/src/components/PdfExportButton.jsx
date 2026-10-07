import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import Icon from './Icon.jsx';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function monthLabel(row, index, count, asOf = new Date()) {
  if (row.year && row.month) return `${row.month} ${row.year}`;

  const lastCompletedMonth = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() - 1, 1));
  const date = new Date(Date.UTC(
    lastCompletedMonth.getUTCFullYear(),
    lastCompletedMonth.getUTCMonth() - (count - index - 1),
    1,
  ));
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export default function PdfExportButton({ profile, months, isSample = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

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

      // Strict math sync with live dashboard state
      const adjustedMonthly = Number(profile?.adjustedMonthlyIncome) || 0;
      const twelveMonthTotal = Number(profile?.annualGross) ||
        reportMonths.reduce((sum, row) => sum + (Number(row.total ?? row.amount) || 0), 0);
      const activeMonthsCount = Number(profile?.activeMonths) ||
        reportMonths.filter((m) => (Number(m.total ?? m.amount) || 0) > 0).length;

      const isPurelyManual = profile?.isPurelyManual || (!isSample && profile?.verificationStatus === 'Self-Reported');
      const verificationStatus = isPurelyManual
        ? 'Self-Reported'
        : (profile?.verificationStatus === 'API Verified' ? 'API Verified' : 'Self-Reported');

      const reliabilityScoreDisplay = isPurelyManual
        ? 'Unverified'
        : `${Math.round(Number(profile?.reliabilityScore) || 0)} / 100`;

      const generatedDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const certRef = `GP-${Date.now().toString(36).toUpperCase().slice(-6)}`;

      doc.setProperties({
        title: `Gigproof - Proof of Income (${certRef})`,
        subject: '12-Month Consolidated Gig Income Certification',
        author: 'Gigproof Financial Technologies',
      });

      // --- HEADER BANNER ---
      // Brand forest primary background
      doc.setFillColor(26, 56, 43);
      doc.rect(0, 0, 210, 42, 'F');

      // Top bar accent line
      doc.setFillColor(58, 99, 81);
      doc.rect(0, 41.2, 210, 0.8, 'F');

      // Brand Wordmark
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('gigproof.', 16, 14);

      // Title & Subtitle
      doc.setFontSize(18);
      doc.text('Proof of Income Certification', 16, 25);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(204, 219, 210);
      doc.text('Consolidated 12-Month Trailing Gig Platform Earnings Summary', 16, 33);

      // Certificate reference and date (right aligned)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`DOC REF: ${certRef}`, 194, 14, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(204, 219, 210);
      doc.text(`Issued: ${generatedDate}`, 194, 21, { align: 'right' });
      doc.text('Standardized Underwriting Format', 194, 28, { align: 'right' });

      // --- VERIFICATION & STATUS STRIP ---
      const badgeY = 49;
      doc.setFillColor(244, 246, 241);
      doc.rect(16, badgeY, 178, 12, 'F');
      doc.setDrawColor(218, 226, 216);
      doc.rect(16, badgeY, 178, 12, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(70, 84, 75);
      doc.text('VERIFICATION STATUS:', 20, badgeY + 7.5);

      const statusBadgeX = 64;
      if (verificationStatus === 'API Verified') {
        doc.setFillColor(224, 239, 228);
        doc.roundedRect(statusBadgeX, badgeY + 2.5, 28, 7, 1.5, 1.5, 'F');
        doc.setTextColor(25, 95, 45);
        doc.setFontSize(8);
        doc.text('API VERIFIED', statusBadgeX + 3.5, badgeY + 7.2);
      } else {
        doc.setFillColor(245, 237, 224);
        doc.roundedRect(statusBadgeX, badgeY + 2.5, 32, 7, 1.5, 1.5, 'F');
        doc.setTextColor(130, 80, 20);
        doc.setFontSize(8);
        doc.text('SELF-REPORTED', statusBadgeX + 3.5, badgeY + 7.2);
      }

      if (isSample) {
        doc.setTextColor(150, 95, 30);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.text('Illustrative sample dataset • Not valid for application submission', 105, badgeY + 7.5);
      } else {
        doc.setTextColor(90, 104, 94);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text('Synchronized via secure Gigproof worker workspace', 105, badgeY + 7.5);
      }

      // --- KEY METRICS SUMMARY BLOCKS ---
      const metricsY = 67;

      // Card 1: Adjusted Monthly Income
      doc.setFillColor(252, 252, 250);
      doc.rect(16, metricsY, 86, 29, 'F');
      doc.setDrawColor(218, 226, 216);
      doc.rect(16, metricsY, 86, 29, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 114, 105);
      doc.text('ADJUSTED MONTHLY INCOME', 21, metricsY + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(26, 56, 43);
      doc.text(currency.format(adjustedMonthly), 21, metricsY + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(105, 118, 110);
      doc.text('Stability & recency weighted for underwriting', 21, metricsY + 24.5);

      // Card 2: Reliability Score
      doc.setFillColor(252, 252, 250);
      doc.rect(108, metricsY, 86, 29, 'F');
      doc.setDrawColor(218, 226, 216);
      doc.rect(108, metricsY, 86, 29, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 114, 105);
      doc.text('RELIABILITY SCORE', 113, metricsY + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(isPurelyManual ? 140 : 26, isPurelyManual ? 90 : 56, isPurelyManual ? 30 : 43);
      doc.text(reliabilityScoreDisplay, 113, metricsY + 18);

      // Mandatory small-text disclaimer directly below score
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(110, 122, 114);
      doc.text('Score is based on API-verified sources. Self-reported income is unverified.', 113, metricsY + 24.5);

      // --- SECONDARY METRICS ROW ---
      const secY = 101;
      doc.setFillColor(248, 250, 246);
      doc.rect(16, secY, 178, 10, 'F');
      doc.setDrawColor(226, 232, 224);
      doc.rect(16, secY, 178, 10, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(55, 70, 60);
      doc.text('12-Month Total Gross:', 20, secY + 6.5);
      doc.text(currency.format(twelveMonthTotal), 55, secY + 6.5);

      doc.text('Active Earning Months:', 95, secY + 6.5);
      doc.text(`${activeMonthsCount} of 12`, 130, secY + 6.5);

      doc.text('Aggregated Platforms:', 152, secY + 6.5);
      const sourcesCount = profile?.sources?.length || (isSample ? 3 : 1);
      doc.text(`${sourcesCount} source${sourcesCount === 1 ? '' : 's'}`, 183, secY + 6.5);

      // --- TABLE 1: MONTHLY PAYOUT HISTORY ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(26, 56, 43);
      doc.text('Monthly Payout History', 16, 119);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(95, 107, 98);
      doc.text('Income recorded in each calendar month across the trailing 12-month evaluation window', 16, 123.5);

      autoTable(doc, {
        startY: 126,
        head: [['Income Month', 'Calendar Year', 'Recorded Payout Total']],
        body: reportMonths.map((row, index) => [
          monthLabel(row, index, reportMonths.length),
          row.year ? String(row.year) : new Date().getUTCFullYear(),
          currency.format(Number(row.total ?? row.amount) || 0),
        ]),
        foot: [[
          '12-Month Total Gross',
          'Trailing 365 Days',
          currency.format(twelveMonthTotal),
        ]],
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 2.4,
          textColor: [40, 52, 44],
          lineColor: [222, 228, 220],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [26, 56, 43],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        footStyles: {
          fillColor: [238, 243, 235],
          textColor: [26, 56, 43],
          fontStyle: 'bold',
          fontSize: 8.5,
        },
        alternateRowStyles: {
          fillColor: [250, 251, 248],
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 50 },
          2: { halign: 'right', cellWidth: 58 },
        },
        margin: { left: 16, right: 16, bottom: 22 },
        didDrawPage: () => {
          // Bottom footer on every page
          doc.setDrawColor(218, 226, 216);
          doc.line(16, 280, 194, 280);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(115, 128, 120);
          doc.text('Gigproof Certified Statement · Underwriting standard for gig workers, freelancers & independent contractors.', 16, 285);
          doc.text(`Page ${doc.internal.getNumberOfPages()}`, 194, 285, { align: 'right' });
        },
      });

      // --- PLATFORM SOURCES BREAKDOWN ---
      const finalY = doc.lastAutoTable?.finalY || 220;
      if (finalY < 235 && profile?.sources && profile.sources.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(26, 56, 43);
        doc.text('Income Sources Breakdown', 16, finalY + 8);

        autoTable(doc, {
          startY: finalY + 11,
          head: [['Platform / Service', 'Verification Mode', 'Cumulative Trailing Amount']],
          body: profile.sources.map((src) => [
            src.platform || 'Unknown',
            isPurelyManual ? 'Self-Reported Entry' : 'API Connection (Argyle/Plaid)',
            currency.format(Number(src.total) || 0),
          ]),
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 7.5,
            cellPadding: 2,
            textColor: [40, 52, 44],
            lineColor: [222, 228, 220],
            lineWidth: 0.2,
          },
          headStyles: {
            fillColor: [60, 88, 73],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7.5,
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 50 },
            2: { halign: 'right', cellWidth: 58 },
          },
          margin: { left: 16, right: 16, bottom: 22 },
        });
      }

      const filename = isSample ? 'gigproof-proof-of-income-sample.pdf' : 'gigproof-proof-of-income.pdf';
      doc.save(filename);
      showToast('Proof of income PDF downloaded successfully.', 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('The PDF could not be generated. Please try again.');
      showToast('Could not generate PDF. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="button-secondary pdf-export-button" type="button" onClick={exportPdf} disabled={busy}>
        <Icon name="report" size={16} />
        {busy ? 'Preparing PDF…' : 'Download proof of income'}
      </button>
      <span className="sr-only" role="status" aria-live="polite">{error}</span>
    </>
  );
}
