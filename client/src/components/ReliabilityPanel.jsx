import { Link } from 'react-router-dom';
import { useIncome } from '../context/IncomeContext.jsx';
import Icon from './Icon.jsx';

export default function ReliabilityPanel() {
  const { incomeProfile, displayConnections, mockDataEnabled } = useIncome();

  const isPurelyManual = incomeProfile?.isPurelyManual;
  const score = Math.round(incomeProfile?.reliabilityScore ?? 0);
  const activeMonths = incomeProfile?.activeMonths ?? 0;
  const platformCount = displayConnections?.length ?? 0;

  let statusLabel = 'Strong';
  let statusClass = 'strong';
  let explanation = 'Your income has been steady across multiple sources this year.';

  if (isPurelyManual) {
    statusLabel = 'Unverified';
    statusClass = 'unverified';
    explanation = 'Income records are self-reported. Official reliability ratings require API verification.';
  } else if (score === 0) {
    statusLabel = 'Pending Data';
    statusClass = 'pending';
    explanation = 'Add your income payouts to compute your reliability score.';
  } else if (score < 50) {
    statusLabel = 'Building History';
    statusClass = 'building';
    explanation = 'Initial payouts recorded. Add more months to strengthen your reliability rating.';
  } else if (score < 80) {
    statusLabel = 'Moderate';
    statusClass = 'moderate';
    explanation = 'Consistent earnings recorded with slight variance between payout cycles.';
  }

  const factors = [
    {
      label: 'Income consistency',
      value: isPurelyManual ? 'Self-Reported' : score > 75 ? 'Strong' : score > 40 ? 'Moderate' : 'Developing',
      width: isPurelyManual ? '40%' : `${Math.max(10, Math.min(100, score))}%`,
    },
    {
      label: 'Active income months',
      value: `${activeMonths} of 12`,
      width: `${Math.round((activeMonths / 12) * 100)}%`,
    },
    {
      label: 'Income sources',
      value: `${platformCount} platform${platformCount === 1 ? '' : 's'}`,
      width: `${Math.min(100, platformCount * 33)}%`,
    },
  ];

  return (
    <section className="reliability-panel" aria-labelledby="reliability-title">
      <div className="reliability-topline">
        <div>
          <h2 id="reliability-title">Reliability score</h2>
          <p>Based on your income history</p>
        </div>
        <span className={`score-status score-status-${statusClass}`}>
          <i />{statusLabel}
        </span>
      </div>

      <div className="score-reading">
        {isPurelyManual ? (
          <span className="score-number score-unverified-tag">Unverified</span>
        ) : (
          <>
            <span className="score-number">{score}</span>
            <span className="score-out-of">/ 100</span>
          </>
        )}
      </div>
      <p className="score-disclaimer">
        Score is based on API-verified sources. Self-reported income is unverified.
      </p>
      <p className="score-explanation">{explanation}</p>

      <div className="score-factors">
        {factors.map((factor) => (
          <div className="factor-row" key={factor.label}>
            <div className="factor-label">
              <span>{factor.label}</span>
              <strong>{factor.value}</strong>
            </div>
            <div className="factor-track" aria-hidden="true">
              <span style={{ width: factor.width }} />
            </div>
          </div>
        ))}
      </div>

      <Link className="text-link" to="/income-history">
        View income history <Icon name="arrow" size={15} />
      </Link>
      <p className="sample-caption">
        {mockDataEnabled ? 'Illustrative score · reflects sample dataset' : 'Calculated in real-time from your submitted records'}
      </p>
    </section>
  );
}
