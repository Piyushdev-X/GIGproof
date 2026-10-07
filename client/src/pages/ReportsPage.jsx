import Icon from '../components/Icon.jsx';
import MockDataToggle from '../components/MockDataToggle.jsx';
import PdfExportButton from '../components/PdfExportButton.jsx';
import { useIncome } from '../context/IncomeContext.jsx';
import { formatCurrency } from '../data/demoIncome.js';

export default function ReportsPage({ onOpenManual }) {
  const { incomeProfile, mockDataEnabled, displayConnections } = useIncome();

  const adjustedMonthly = incomeProfile?.adjustedMonthlyIncome ?? 0;
  const reliabilityScore = Math.round(incomeProfile?.reliabilityScore ?? 0);
  const annualGross = incomeProfile?.annualGross ?? 0;
  const activeMonths = incomeProfile?.activeMonths ?? 0;
  const isSample = mockDataEnabled && incomeProfile?.isSample;

  return (
    <div className="reports-page">
      <div className="page-title-row">
        <div>
          <p className="demo-label">
            <i className={mockDataEnabled ? 'is-demo' : 'is-live'} />
            {mockDataEnabled ? 'VERIFICATION REPORT • SAMPLE' : 'OFFICIAL STATEMENT • ACTIVE DATA'}
          </p>
          <h1>Proof of income report</h1>
          <p className="page-subtitle">Standardized earnings documentation ready for landlords and lenders.</p>
        </div>
        <div className="page-actions">
          <MockDataToggle variant="header" />
          <PdfExportButton
            profile={incomeProfile}
            months={incomeProfile?.months}
            isSample={isSample}
          />
        </div>
      </div>

      <div className="report-preview-banner panel">
        <div className="report-preview-header">
          <div className="report-doc-title">
            <span className="brand-mark small">g</span>
            <div>
              <h2>Standardized Proof of Income</h2>
              <p>Official 12-month consolidated gig earnings certification</p>
            </div>
          </div>
          <span className={`verification-badge ${incomeProfile?.verificationStatus === 'API Verified' ? 'is-api' : 'is-self'}`}>
            <Icon name="shield" size={14} />
            {incomeProfile?.verificationStatus || 'Self-Reported'}
          </span>
        </div>

        <div className="report-metrics-strip">
          <div className="report-metric-cell">
            <span className="cell-label">Certified Monthly Income</span>
            <strong className="cell-val text-forest">{formatCurrency(adjustedMonthly)}</strong>
            <span className="cell-sub">Adjusted for stability</span>
          </div>
          <div className="report-metric-cell">
            <span className="cell-label">Reliability Index</span>
            <strong className="cell-val">{reliabilityScore} <small>/ 100</small></strong>
            <span className="cell-sub">12-month consistency</span>
          </div>
          <div className="report-metric-cell">
            <span className="cell-label">Trailing Annual Gross</span>
            <strong className="cell-val">{formatCurrency(annualGross)}</strong>
            <span className="cell-sub">{activeMonths} of 12 active months</span>
          </div>
          <div className="report-metric-cell">
            <span className="cell-label">Connected Platforms</span>
            <strong className="cell-val">{displayConnections.length}</strong>
            <span className="cell-sub">Aggregated sources</span>
          </div>
        </div>

        <div className="report-preview-cta">
          <p>
            This document translates variable gig payouts into an underwriting-compliant proof of income with transparent breakdown and verifiable dates.
          </p>
          <PdfExportButton
            profile={incomeProfile}
            months={incomeProfile?.months}
            isSample={isSample}
          />
        </div>
      </div>

      <div className="report-grid-section">
        <div className="panel report-methodology-card">
          <h3>Underwriting & Calculation Methodology</h3>
          <ul className="methodology-list">
            <li>
              <strong>Trailing 12-Month Grouping:</strong> Calculates income grouped into standard calendar months, preserving inactive months without artificial smoothing.
            </li>
            <li>
              <strong>Recency Weighting:</strong> Gives higher importance to earnings in the recent 3 months compared to older quarters.
            </li>
            <li>
              <strong>Gap & Volatility Adjustment:</strong> Applies stability penalties for gaps exceeding 45 days and rewards multi-platform income diversification.
            </li>
            <li>
              <strong>Anti-Fraud Verification Seal:</strong> Distinctly flags automated API verifications versus manual self-reported entries.
            </li>
          </ul>
        </div>

        <div className="panel report-checklist-card">
          <h3>Acceptance Guidelines</h3>
          <p className="checklist-sub">Supported decision-makers:</p>
          <ul className="checklist-items">
            <li><span className="check-icon">✓</span> <strong>Residential Landlords:</strong> Proof of consistent rent-paying capacity.</li>
            <li><span className="check-icon">✓</span> <strong>NBFC & Digital Lenders:</strong> Unsecured credit and two-wheeler loans.</li>
            <li><span className="check-icon">✓</span> <strong>Credit Card Issuers:</strong> Supplementary income verification.</li>
          </ul>
          {onOpenManual && (
            <button className="button-secondary w-full mt-4" type="button" onClick={onOpenManual}>
              <Icon name="plus" size={15} /> Add more payouts to report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
