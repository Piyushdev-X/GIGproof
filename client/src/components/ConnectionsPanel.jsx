import { connections } from '../data/demoIncome.js';
import Icon from './Icon.jsx';

export default function ConnectionsPanel({ onConnect }) {
  return (
    <section className="panel connections-panel" id="connections" aria-labelledby="connections-title">
      <div className="panel-heading"><div><h2 id="connections-title">Income sources</h2><p>Accounts sharing payout history</p></div><span className="source-count">3</span></div>
      <ul className="source-list">
        {connections.map((account) => <li className="source-row" key={account.name}><span className={`platform-mark ${account.tone}`}>{account.mark}</span><span className="source-copy"><strong>{account.name}</strong><small>{account.detail}</small></span><span className="connected-state"><i />Connected</span></li>)}
      </ul>
      <button className="add-source-button is-disabled" type="button" disabled aria-describedby="connections-coming-soon"><Icon name="links" size={16} /> Connect another account <span className="coming-soon-badge">Coming soon</span></button>
      <span className="sr-only" id="connections-coming-soon">Argyle and Plaid account linking is coming soon.</span>
      <button className="text-link source-help-link" type="button" onClick={onConnect}>About account connections</button>
    </section>
  );
}
