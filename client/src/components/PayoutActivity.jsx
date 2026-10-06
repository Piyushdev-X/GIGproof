import { formatCurrency, payouts } from '../data/demoIncome.js';

export default function PayoutActivity() {
  return (
    <section className="panel payout-panel" aria-labelledby="payout-title">
      <div className="panel-heading"><div><h2 id="payout-title">Recent payouts</h2><p>Latest deposits across your accounts</p></div><a className="text-link" href="#income-history">View history <span aria-hidden="true">→</span></a></div>
      <div className="payout-table-wrap"><table className="payout-table">
        <thead><tr><th scope="col">Platform</th><th scope="col">Payout date</th><th scope="col">Amount</th></tr></thead>
        <tbody>{payouts.map((payout) => <tr key={`${payout.platform}-${payout.date}`}><td><span className="payout-platform"><span className={`platform-mark small ${payout.tone}`}>{payout.mark}</span>{payout.platform}</span></td><td>{payout.date}</td><td className="payout-amount">{formatCurrency(payout.amount)}</td></tr>)}</tbody>
      </table></div>
      <p className="table-caption">Sample payouts shown for illustration</p>
    </section>
  );
}
