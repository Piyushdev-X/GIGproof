import { useState } from 'react';
import { useIncome } from '../context/IncomeContext.jsx';
import { formatCompactCurrency, formatCurrency } from '../data/demoIncome.js';

export default function IncomeChart({ onAddIncome }) {
  const { incomeProfile, mockDataEnabled } = useIncome();
  const [period, setPeriod] = useState('12-months');

  const months = incomeProfile?.months || [];
  const visibleIncome = period === '6-months' ? months.slice(-6) : months;
  const totals = visibleIncome.map((item) => item.total || 0);
  const maximum = Math.max(...totals, 0);
  const axisMaximum = Math.max(15000, Math.ceil((maximum || 15000) / 15000) * 15000);
  const minimum = Math.min(...totals, 0);
  const hasData = totals.some((t) => t > 0);

  const startLabel = visibleIncome[0] ? `${visibleIncome[0].month} ${visibleIncome[0].year || ''}` : '';
  const endLabel = visibleIncome.at(-1) ? `${visibleIncome.at(-1).month} ${visibleIncome.at(-1).year || ''}` : '';

  return (
    <section className="panel income-panel" id="income-history-panel" aria-labelledby="income-chart-title">
      <div className="panel-heading income-panel-heading">
        <div>
          <h2 id="income-chart-title">Income over time</h2>
          <p>Monthly payouts from your connected platforms</p>
        </div>
        <label className="period-select-label">
          <span className="sr-only">Income period</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Income period">
            <option value="12-months">Last 12 months</option>
            <option value="6-months">Last 6 months</option>
          </select>
        </label>
      </div>

      <div className="chart-legend" aria-label="Income by source">
        <span><i className="legend-mark rideshare" />Food delivery</span>
        <span><i className="legend-mark freelance" />Freelance</span>
        <span><i className="legend-mark shop" />Mobility / Other</span>
      </div>

      <div
        className="chart-area"
        role="img"
        aria-label={`Monthly payout chart, ${startLabel} through ${endLabel}. Range: ${formatCurrency(minimum)} to ${formatCurrency(maximum)}.`}
      >
        <div className="chart-axis" aria-hidden="true">
          {[3, 2, 1, 0].map((step) => (
            <span key={step}>{formatCompactCurrency((axisMaximum / 3) * step)}</span>
          ))}
        </div>
        <div className="chart-grid-lines" aria-hidden="true">
          <i /><i /><i /><i />
        </div>

        <div className="chart-bars">
          {visibleIncome.map((item, index) => {
            const hasMonthIncome = (item.total || 0) > 0;
            const barHeightPercent = hasMonthIncome ? Math.max(8, ((item.total || 0) / axisMaximum) * 100) : 0;
            const sources = item.sources || [0, 0, 0];
            const sourceTotal = sources[0] + sources[1] + sources[2] || item.total || 1;

            return (
              <div className="chart-column" key={`${item.month}-${index}`} aria-hidden="true">
                <div
                  className={`stacked-bar ${!hasMonthIncome ? 'is-empty-bar' : ''}`}
                  style={{ height: `${barHeightPercent}%` }}
                  title={`${item.month}: ${formatCurrency(item.total || 0)}`}
                >
                  {hasMonthIncome ? (
                    <>
                      <i className="bar-segment shop" style={{ flex: sources[2] || (sourceTotal ? 0.2 : 0) }} />
                      <i className="bar-segment freelance" style={{ flex: sources[1] || (sourceTotal ? 0.3 : 0) }} />
                      <i className="bar-segment rideshare" style={{ flex: sources[0] || (sourceTotal ? 0.5 : 0) }} />
                    </>
                  ) : (
                    <div className="empty-bar-slot" />
                  )}
                </div>
                <span>{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chart-footnote">
        <span>{startLabel && endLabel ? `${startLabel} — ${endLabel}` : 'Trailing 12-month period'}</span>
        <span>{mockDataEnabled ? 'Illustrative sample dataset' : 'Verified & manual user records'}</span>
      </div>
    </section>
  );
}
