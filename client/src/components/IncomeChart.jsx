import { useState } from 'react';
import { formatCompactCurrency, formatCurrency, monthlyIncome } from '../data/demoIncome.js';

export default function IncomeChart() {
  const [period, setPeriod] = useState('12-months');
  const visibleIncome = period === '6-months' ? monthlyIncome.slice(-6) : monthlyIncome;
  const maximum = Math.max(...visibleIncome.map((item) => item.total));
  const axisMaximum = Math.ceil(maximum / 15000) * 15000;
  const minimum = Math.min(...visibleIncome.map((item) => item.total));
  return (
    <section className="panel income-panel" id="income-history" aria-labelledby="income-chart-title">
      <div className="panel-heading income-panel-heading">
        <div><h2 id="income-chart-title">Income over time</h2><p>Monthly payouts from your connected platforms</p></div>
        <label className="period-select-label"><span className="sr-only">Income period</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Income period"><option value="12-months">Last 12 months</option><option value="6-months">Last 6 months</option></select>
        </label>
      </div>
      <div className="chart-legend" aria-label="Income by source">
        <span><i className="legend-mark rideshare" />Food delivery</span><span><i className="legend-mark freelance" />Freelance</span><span><i className="legend-mark shop" />Mobility</span>
      </div>
      <div className="chart-area" role="img" aria-label={`Illustrative monthly payout chart, ${visibleIncome[0].month} through ${visibleIncome.at(-1).month}. Monthly totals range from ${formatCurrency(minimum)} to ${formatCurrency(maximum)}.`}>
        <div className="chart-axis" aria-hidden="true">{[3, 2, 1, 0].map((step) => <span key={step}>{formatCompactCurrency((axisMaximum / 3) * step)}</span>)}</div>
        <div className="chart-grid-lines" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="chart-bars">
          {visibleIncome.map((item) => (
            <div className="chart-column" key={item.month} aria-hidden="true">
              <div className="stacked-bar" style={{ height: `${(item.total / axisMaximum) * 100}%` }}>
                <i className="bar-segment shop" style={{ flex: item.sources[2] }} /><i className="bar-segment freelance" style={{ flex: item.sources[1] }} /><i className="bar-segment rideshare" style={{ flex: item.sources[0] }} />
              </div><span>{item.month}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-footnote"><span>{period === '6-months' ? 'Apr 2026 — Sep 2026' : 'Oct 2025 — Sep 2026'}</span><span>Illustrative sample data</span></div>
    </section>
  );
}
