import Icon from './Icon.jsx';

const navigation = [
  { label: 'Overview', icon: 'overview', href: '#overview', active: true },
  { label: 'Income history', icon: 'income', href: '#income-history' },
  { label: 'Connections', icon: 'links', href: '#connections' },
  { label: 'Reports', icon: 'report', href: '#reports' },
];

export default function DashboardSidebar({ userEmail = '', onSignOut, signOutBusy = false }) {
  const initials = (userEmail || 'GW').slice(0, 2).toUpperCase();
  return (
    <aside className="dashboard-rail" aria-label="Main navigation">
      <a className="brand-lockup" href="#overview" aria-label="Gigproof home">
        <span className="brand-mark" aria-hidden="true">g</span>
        <span className="brand-name">gigproof<span>.</span></span>
      </a>
      <div className="rail-caption">Your workspace</div>
      <nav className="rail-nav">
        {navigation.map((item) => (
          <a key={item.label} className={`rail-link${item.active ? ' is-active' : ''}`} href={item.href} aria-current={item.active ? 'page' : undefined}>
            <Icon name={item.icon} size={18} /><span>{item.label}</span>
            {item.label === 'Reports' && <span className="rail-soon">Soon</span>}
          </a>
        ))}
      </nav>
      <div className="rail-bottom">
        <div className="privacy-note"><Icon name="shield" size={17} /><span>Only you can see<br />your income details.</span></div>
        <div className="profile-button">
          <span className="avatar">{initials}</span><span className="profile-copy"><strong>{userEmail || 'Gig worker'}</strong><small>Signed in</small></span>
          <button className="profile-signout" type="button" onClick={onSignOut} disabled={signOutBusy} aria-label="Sign out of Gigproof">
            {signOutBusy ? '…' : 'Sign out'}
          </button>
        </div>
      </div>
    </aside>
  );
}
