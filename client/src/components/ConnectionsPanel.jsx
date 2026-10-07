import { Link } from 'react-router-dom';
import { useIncome } from '../context/IncomeContext.jsx';
import Icon from './Icon.jsx';

export default function ConnectionsPanel({ onConnect }) {
  const { displayConnections, mockDataEnabled } = useIncome();

  return (
    <section className="panel connections-panel" id="connections-panel" aria-labelledby="connections-title">
      <div className="panel-heading">
        <div>
          <h2 id="connections-title">Income sources</h2>
          <p>Accounts sharing payout history</p>
        </div>
        <span className="source-count">{displayConnections.length}</span>
      </div>

      <ul className="source-list">
        {displayConnections.length === 0 ? (
          <li className="source-empty-hint">
            No platforms connected yet.
          </li>
        ) : (
          displayConnections.map((account) => (
            <li className="source-row" key={account.name}>
              <span className={`platform-mark ${account.tone || 'green'}`}>{account.mark}</span>
              <span className="source-copy">
                <strong>{account.name}</strong>
                <small>{account.detail}</small>
              </span>
              <span className="connected-state">
                <i />Connected
              </span>
            </li>
          ))
        )}
      </ul>

      <div className="connections-actions-wrap">
        <button
          className="add-source-button is-disabled"
          type="button"
          disabled
          aria-describedby="connections-coming-soon"
        >
          <Icon name="links" size={16} /> Connect another account <span className="coming-soon-badge">Coming soon</span>
        </button>
        <span className="sr-only" id="connections-coming-soon">
          Argyle and Plaid account linking is coming soon.
        </span>
        <div className="connections-bottom-row">
          <Link className="text-link" to="/connections">
            Manage all connections <Icon name="arrow" size={14} />
          </Link>
          <button className="text-link source-help-link" type="button" onClick={onConnect}>
            About connections
          </button>
        </div>
      </div>
    </section>
  );
}
