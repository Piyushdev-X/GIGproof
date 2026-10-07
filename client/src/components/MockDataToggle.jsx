import { useIncome } from '../context/IncomeContext.jsx';
import Icon from './Icon.jsx';

export default function MockDataToggle({ variant = 'sidebar' }) {
  const { mockDataEnabled, toggleMockData, userPayouts } = useIncome();

  if (variant === 'header') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={mockDataEnabled}
        onClick={toggleMockData}
        className={`mock-toggle-header ${mockDataEnabled ? 'is-active' : 'is-inactive'}`}
        title={mockDataEnabled ? 'Showing illustrative mock data. Click to view only real entries.' : 'Showing live entries only. Click to enable sample data.'}
      >
        <span className="mock-toggle-indicator" aria-hidden="true">
          <span className="mock-toggle-knob" />
        </span>
        <span className="mock-toggle-label">
          {mockDataEnabled ? 'Sample Data' : 'Real Data'}
        </span>
        {userPayouts.length > 0 && !mockDataEnabled && (
          <span className="mock-toggle-badge">{userPayouts.length} entries</span>
        )}
      </button>
    );
  }

  return (
    <div className="rail-mock-toggle">
      <div className="rail-mock-info">
        <span className="rail-mock-title">Illustrative Data</span>
        <span className="rail-mock-desc">
          {mockDataEnabled ? 'Previewing ₹35k/mo dataset' : 'Viewing real records only'}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={mockDataEnabled}
        onClick={toggleMockData}
        className={`mock-switch ${mockDataEnabled ? 'is-on' : 'is-off'}`}
        aria-label="Toggle illustrative mock data"
      >
        <span className="mock-switch-thumb" />
      </button>
    </div>
  );
}
