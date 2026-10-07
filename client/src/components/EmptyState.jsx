import Icon from './Icon.jsx';

export default function EmptyState({ onAddIncome, onEnableMock }) {
  return (
    <div className="editorial-empty-state">
      <div className="empty-state-card">
        <div className="empty-state-badge">
          <Icon name="shield" size={16} />
          <span>Real Data Mode</span>
        </div>
        <h2 className="empty-state-title">No income records yet</h2>
        <p className="empty-state-desc">
          You are viewing your live workspace with mock data toggled off. Add your first payout to generate your real-time reliability score, income graph, and verified proof-of-income PDF.
        </p>

        <div className="empty-state-actions">
          <button className="button-primary empty-primary-btn" type="button" onClick={onAddIncome}>
            <Icon name="plus" size={17} /> Add income manually
          </button>
          {onEnableMock && (
            <button className="button-secondary empty-secondary-btn" type="button" onClick={onEnableMock}>
              Explore sample dataset
            </button>
          )}
        </div>

        <div className="empty-state-features">
          <div className="empty-feature">
            <span className="feature-dot" />
            <span><strong>Instant Calculation</strong> — Monthly averages & reliability score update immediately</span>
          </div>
          <div className="empty-feature">
            <span className="feature-dot" />
            <span><strong>Private & Secure</strong> — Only you have access to your payout records</span>
          </div>
          <div className="empty-feature">
            <span className="feature-dot" />
            <span><strong>Shareable PDF</strong> — Export standardized reports for housing and loans</span>
          </div>
        </div>
      </div>
    </div>
  );
}
