import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import IncomeChart from '../components/IncomeChart.jsx';
import MockDataToggle from '../components/MockDataToggle.jsx';
import PdfExportButton from '../components/PdfExportButton.jsx';
import ReliabilityPanel from '../components/ReliabilityPanel.jsx';
import ConnectionsPanel from '../components/ConnectionsPanel.jsx';
import PayoutActivity from '../components/PayoutActivity.jsx';
import { useIncome } from '../context/IncomeContext.jsx';
import { formatCurrency } from '../data/demoIncome.js';

export default function OverviewPage({ onOpenManual, onOpenConnect }) {
  const { incomeProfile, mockDataEnabled, toggleMockData, isEmpty, displayConnections } = useIncome();

  const adjustedMonthly = incomeProfile?.adjustedMonthlyIncome ?? 0;
  const annualGross = incomeProfile?.annualGross ?? 0;
  const activeMonths = incomeProfile?.activeMonths ?? 0;
  const sourceCount = displayConnections?.length ?? 0;

  return (
    <div className="overview-page">
      <div className="page-title-row">
        <div>
          <p className="demo-label">
            <i className={mockDataEnabled ? 'is-demo' : 'is-live'} />
            {mockDataEnabled ? 'SAMPLE DASHBOARD • ILLUSTRATIVE DATA' : 'LIVE WORKSPACE • ACTIVE RECORDS'}
          </p>
          <h1>Your income, in perspective.</h1>
          <p className="page-subtitle">A clearer view of what you earn across your work.</p>
        </div>
        <div className="page-actions">
          <MockDataToggle variant="header" />
          <button className="button-primary" type="button" onClick={onOpenManual}>
            <Icon name="plus" size={17} /> Add income manually
          </button>
          <PdfExportButton
            profile={incomeProfile}
            months={incomeProfile?.months}
            isSample={mockDataEnabled && incomeProfile?.isSample}
          />
          <button
            className="button-secondary is-coming-soon"
            type="button"
            disabled
            aria-describedby="connections-coming-soon"
          >
            <Icon name="links" size={16} /> Connect account <span className="coming-soon-badge">Coming soon</span>
          </button>
        </div>
      </div>

      {isEmpty ? (
        <EmptyState onAddIncome={onOpenManual} onEnableMock={toggleMockData} />
      ) : (
        <>
          <section className="summary-band" aria-label="Income summary">
            <div className="summary-main">
              <p className="summary-label">Adjusted monthly income</p>
              <p className="summary-value">
                {formatCurrency(adjustedMonthly)}
                <span>/mo</span>
              </p>
              <p className="summary-detail">
                <span className="trend-mark">↗</span>
                Across {sourceCount} income source{sourceCount === 1 ? '' : 's'}
                <span className="summary-divider">·</span>
                {activeMonths} active month{activeMonths === 1 ? '' : 's'}
              </p>
            </div>
            <div className="summary-aside">
              <span className="summary-aside-label">12-month payouts</span>
              <strong>{formatCurrency(annualGross)}</strong>
              <span className="summary-aside-detail">Trailing 365 days</span>
            </div>
            <div className="summary-aside summary-aside-last">
              <span className="summary-aside-label">Income months</span>
              <strong>
                {activeMonths} <small>/ 12</small>
              </strong>
              <span className="summary-aside-detail">
                {12 - activeMonths === 0 ? 'No inactive months' : `${12 - activeMonths} inactive month${12 - activeMonths === 1 ? '' : 's'}`}
              </span>
            </div>
          </section>

          <div className="dashboard-grid">
            <IncomeChart onAddIncome={onOpenManual} />
            <ReliabilityPanel />
            <PayoutActivity onAddIncome={onOpenManual} />
            <ConnectionsPanel onConnect={onOpenConnect} />
          </div>
        </>
      )}
    </div>
  );
}
