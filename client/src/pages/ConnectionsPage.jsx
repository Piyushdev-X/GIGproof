import Icon from '../components/Icon.jsx';
import MockDataToggle from '../components/MockDataToggle.jsx';
import { useIncome } from '../context/IncomeContext.jsx';

const allSupportedPlatforms = [
  { name: 'Zomato', category: 'Food Delivery', mark: 'Z', tone: 'orange', description: 'Weekly driver deposits and tip earnings' },
  { name: 'Swiggy', category: 'Food Delivery', mark: 'S', tone: 'orange', description: 'Delivery partner daily & weekly payouts' },
  { name: 'Uber', category: 'Rideshare & Mobility', mark: 'U', tone: 'charcoal', description: 'Direct driver weekly disbursements' },
  { name: 'Ola', category: 'Rideshare & Mobility', mark: 'O', tone: 'charcoal', description: 'Partner earnings and incentive payouts' },
  { name: 'Urban Company', category: 'Home Services', mark: 'U', tone: 'green', description: 'Service partner direct bank deposits' },
  { name: 'Blinkit', category: 'Quick Commerce', mark: 'B', tone: 'orange', description: 'Instant delivery partner payouts' },
  { name: 'Zepto', category: 'Quick Commerce', mark: 'Z', tone: 'orange', description: 'Rider daily and weekly earnings' },
  { name: 'Upwork', category: 'Freelance & Tech', mark: 'u', tone: 'green', description: 'Direct contractor wire & ACH withdrawals' },
];

export default function ConnectionsPage({ onOpenManual, onOpenConnect }) {
  const { displayConnections, mockDataEnabled } = useIncome();

  const connectedPlatformNames = new Set(displayConnections.map((c) => c.name));

  return (
    <div className="connections-page">
      <div className="page-title-row">
        <div>
          <p className="demo-label">
            <i className={mockDataEnabled ? 'is-demo' : 'is-live'} />
            {mockDataEnabled ? 'PLATFORMS • SAMPLE CONNECTIONS' : 'PLATFORMS • LINKED ACCOUNTS'}
          </p>
          <h1>Platform connections</h1>
          <p className="page-subtitle">Manage gig services and marketplaces sharing payout records.</p>
        </div>
        <div className="page-actions">
          <MockDataToggle variant="header" />
          <button className="button-primary" type="button" onClick={() => onOpenManual('')}>
            <Icon name="plus" size={17} /> Add income manually
          </button>
          <button
            className="button-secondary is-coming-soon"
            type="button"
            disabled
            aria-describedby="connections-coming-soon"
          >
            <Icon name="links" size={16} /> Link via Argyle / Plaid <span className="coming-soon-badge">Coming soon</span>
          </button>
        </div>
      </div>

      <div className="connections-grid">
        {allSupportedPlatforms.map((platform) => {
          const isConnected = connectedPlatformNames.has(platform.name);

          return (
            <div className={`platform-card panel ${isConnected ? 'is-connected' : ''}`} key={platform.name}>
              <div className="platform-card-header">
                <span className={`platform-mark ${platform.tone}`}>{platform.mark}</span>
                <div>
                  <h2 className="platform-card-title">{platform.name}</h2>
                  <span className="platform-card-category">{platform.category}</span>
                </div>
                <span className={`connection-badge ${isConnected ? 'is-connected' : 'is-unlinked'}`}>
                  {isConnected ? 'Active' : 'Unlinked'}
                </span>
              </div>

              <p className="platform-card-desc">{platform.description}</p>

              <div className="platform-card-footer">
                {isConnected ? (
                  <button
                    className="card-action-btn is-active-btn"
                    type="button"
                    onClick={() => onOpenManual(platform.name)}
                  >
                    + Add new payout
                  </button>
                ) : (
                  <button
                    className="card-action-btn"
                    type="button"
                    onClick={() => onOpenManual(platform.name)}
                  >
                    + Add manually
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel connections-privacy-card">
        <div className="privacy-card-icon">
          <Icon name="shield" size={24} />
        </div>
        <div className="privacy-card-content">
          <h3>Bank-grade credential safety</h3>
          <p>
            Gigproof never stores your gig platform passwords or bank account credentials. Account aggregation is read-only and strictly scoped to trailing earnings statements for housing and loan verification.
          </p>
        </div>
      </div>
    </div>
  );
}
