import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';
import MockDataToggle from './MockDataToggle.jsx';

const navigation = [
  { label: 'Overview', icon: 'overview', to: '/' },
  { label: 'Income history', icon: 'income', to: '/income-history' },
  { label: 'Connections', icon: 'links', to: '/connections' },
  { label: 'Reports', icon: 'report', to: '/reports' },
];

export default function DashboardSidebar({ userEmail = '', isGuest = false, onSignOut, signOutBusy = false }) {
  const displayName = isGuest ? 'Guest' : (userEmail || 'Gig worker');
  const initials = isGuest ? '👤' : (userEmail || 'GW').slice(0, 2).toUpperCase();

  return (
    <aside className="dashboard-rail" aria-label="Main navigation">
      <NavLink className="brand-lockup" to="/" aria-label="Gigproof home">
        <span className="brand-mark" aria-hidden="true">g</span>
        <span className="brand-name">gigproof<span>.</span></span>
      </NavLink>

      <div className="rail-caption">Your workspace</div>
      <nav className="rail-nav">
        {navigation.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `rail-link${isActive ? ' is-active' : ''}`}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="rail-bottom">
        <MockDataToggle variant="sidebar" />

        {isGuest && (
          <div className="rail-guest-notice">
            <Icon name="shield" size={15} />
            <span>Guest session — <a href="#guest-banner" className="rail-guest-link">save account</a></span>
          </div>
        )}

        <div className="privacy-note">
          <Icon name="shield" size={17} />
          <span>Only you can see<br />your income details.</span>
        </div>

        <div className="profile-button">
          <span className={`avatar${isGuest ? ' avatar-guest' : ''}`}>{initials}</span>
          <span className="profile-copy">
            <strong>{displayName}</strong>
            <small>{isGuest ? 'Temporary session' : 'Signed in'}</small>
          </span>
          <button
            className="profile-signout"
            type="button"
            onClick={onSignOut}
            disabled={signOutBusy}
            aria-label="Sign out of Gigproof"
          >
            {signOutBusy ? '…' : 'Sign out'}
          </button>
        </div>
      </div>
    </aside>
  );
}
