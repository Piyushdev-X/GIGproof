import { Link } from 'react-router-dom';
import { useIncome } from '../context/IncomeContext.jsx';
import { formatCurrency } from '../data/demoIncome.js';

export default function PayoutActivity({ onAddIncome }) {
  const { displayPayouts, mockDataEnabled } = useIncome();

  return (
    <section className="panel payout-panel" aria-labelledby="payout-title">
      <div className="panel-heading">
        <div>
          <h2 id="payout-title">Recent payouts</h2>
          <p>Latest deposits across your accounts</p>
        </div>
        <Link className="text-link" to="/income-history">
          View history <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="payout-table-wrap">
        {displayPayouts.length === 0 ? (
          <div className="empty-payouts-box">
            <p>No recent payouts recorded.</p>
            {onAddIncome && (
              <button className="button-secondary text-xs mt-2" type="button" onClick={onAddIncome}>
                + Add your first payout
              </button>
            )}
          </div>
        ) : (
          <table className="payout-table">
            <thead>
              <tr>
                <th scope="col">Platform</th>
                <th scope="col">Payout date</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {displayPayouts.slice(0, 5).map((payout, index) => (
                <tr key={`${payout.id || payout.platform}-${payout.rawDate || index}`}>
                  <td>
                    <span className="payout-platform">
                      <span className={`platform-mark small ${payout.tone}`}>{payout.mark}</span>
                      {payout.platform}
                      {payout.isSample && <span className="sample-badge">Sample</span>}
                    </span>
                  </td>
                  <td>{payout.date}</td>
                  <td className="payout-amount">{formatCurrency(payout.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="table-caption">
        {mockDataEnabled ? 'Sample payouts shown for illustration' : 'Live payout logs from your session'}
      </p>
    </section>
  );
}
