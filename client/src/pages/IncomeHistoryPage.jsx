import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import MockDataToggle from '../components/MockDataToggle.jsx';
import PdfExportButton from '../components/PdfExportButton.jsx';
import { useIncome } from '../context/IncomeContext.jsx';
import { formatCurrency } from '../data/demoIncome.js';

export default function IncomeHistoryPage({ onOpenManual }) {
  const { displayPayouts, incomeProfile, mockDataEnabled, toggleMockData, isEmpty } = useIncome();
  const [platformFilter, setPlatformFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');

  const platforms = useMemo(() => {
    const list = ['All', ...new Set(displayPayouts.map((p) => p.platform).filter(Boolean))];
    return list;
  }, [displayPayouts]);

  const filteredPayouts = useMemo(() => {
    let result = [...displayPayouts];
    if (platformFilter !== 'All') {
      result = result.filter((p) => p.platform === platformFilter);
    }
    result.sort((a, b) => {
      const dateA = new Date(a.rawDate || a.date).getTime();
      const dateB = new Date(b.rawDate || b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return result;
  }, [displayPayouts, platformFilter, sortOrder]);

  const totalFilteredAmount = useMemo(() => {
    return filteredPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredPayouts]);

  return (
    <div className="income-history-page">
      <div className="page-title-row">
        <div>
          <p className="demo-label">
            <i className={mockDataEnabled ? 'is-demo' : 'is-live'} />
            {mockDataEnabled ? 'SAMPLE AUDIT • ILLUSTRATIVE DATA' : 'AUDIT LOG • RECORDED DEPOSITS'}
          </p>
          <h1>Income history</h1>
          <p className="page-subtitle">A chronological record of earnings from your gig accounts.</p>
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
        </div>
      </div>

      {isEmpty ? (
        <EmptyState onAddIncome={onOpenManual} onEnableMock={toggleMockData} />
      ) : (
        <>
          <div className="history-stat-cards">
            <div className="stat-card">
              <span className="stat-label">Total Recorded Earnings</span>
              <strong className="stat-value">{formatCurrency(totalFilteredAmount)}</strong>
              <span className="stat-hint">{filteredPayouts.length} payout events</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Verification Status</span>
              <strong className="stat-value text-emerald-800">
                {incomeProfile?.verificationStatus || 'Self-Reported'}
              </strong>
              <span className="stat-hint">
                {incomeProfile?.hasUnverifiedIncome ? 'Contains self-reported payouts' : '100% API verified'}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active Earning Months</span>
              <strong className="stat-value">{incomeProfile?.activeMonths || 0} / 12</strong>
              <span className="stat-hint">Trailing 1-year window</span>
            </div>
          </div>

          <div className="panel history-table-panel">
            <div className="history-filter-bar">
              <div className="filter-group">
                <span className="filter-label">Filter by Platform:</span>
                <div className="filter-chips">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`filter-chip ${platformFilter === p ? 'is-active' : ''}`}
                      onClick={() => setPlatformFilter(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sort-group">
                <label className="period-select-label">
                  <span className="sr-only">Sort by date</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    aria-label="Sort order"
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="payout-table-wrap">
              <table className="payout-table history-full-table">
                <thead>
                  <tr>
                    <th scope="col">Platform</th>
                    <th scope="col">Date</th>
                    <th scope="col">Verification Method</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="table-empty-row">
                        No payouts match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((payout, index) => (
                      <tr key={`${payout.id || payout.platform}-${index}`}>
                        <td>
                          <span className="payout-platform">
                            <span className={`platform-mark small ${payout.tone}`}>{payout.mark}</span>
                            <strong>{payout.platform}</strong>
                            {payout.isSample && <span className="sample-badge">Sample</span>}
                          </span>
                        </td>
                        <td>{payout.date}</td>
                        <td>
                          <span className="verification-type-badge">
                            {payout.sourceType === 'argyle' || payout.sourceType === 'plaid' ? (
                              <>
                                <Icon name="links" size={13} /> Direct API
                              </>
                            ) : (
                              <>
                                <Icon name="shield" size={13} /> Manual Self-Report
                              </>
                            )}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill ${payout.isVerified ? 'is-verified' : 'is-unverified'}`}>
                            {payout.isVerified ? 'Verified' : 'Self-Reported'}
                          </span>
                        </td>
                        <td className="payout-amount font-semibold text-right">
                          {formatCurrency(payout.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="history-table-footer">
              <span>Showing {filteredPayouts.length} entries</span>
              <span>{mockDataEnabled ? 'Sample dataset displayed' : 'Synchronized with Supabase DB'}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
