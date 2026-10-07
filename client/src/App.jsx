import { useEffect, useState } from 'react';
import Auth from './components/Auth.jsx';
import DashboardSidebar from './components/DashboardSidebar.jsx';
import Icon from './components/Icon.jsx';
import IncomeChart from './components/IncomeChart.jsx';
import ReliabilityPanel from './components/ReliabilityPanel.jsx';
import ConnectionsPanel from './components/ConnectionsPanel.jsx';
import PayoutActivity from './components/PayoutActivity.jsx';
import ConnectAccountDialog from './components/ConnectAccountDialog.jsx';
import ManualEntryDialog from './components/ManualEntryDialog.jsx';
import PdfExportButton from './components/PdfExportButton.jsx';
import GuestBanner from './components/GuestBanner.jsx';
import { formatCurrency, monthlyIncome } from './data/demoIncome.js';
import { supabase } from './lib/supabase.js';

function Dashboard({ userEmail, isGuest, onSignOut, signOutBusy, signOutError }) {
  const [connectOpen, setConnectOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const sampleAnnualIncome = monthlyIncome.reduce((sum, month) => sum + month.total, 0);
  const sampleAdjustedMonthlyIncome = 35000;
  const initials = (userEmail || 'GW').slice(0, 2).toUpperCase();

  return (
    <div className="app-shell min-h-screen bg-paper text-ink" id="overview">
      <DashboardSidebar userEmail={userEmail} isGuest={isGuest} onSignOut={onSignOut} signOutBusy={signOutBusy} />
      <main className="workspace-main">
        <header className="mobile-topbar">
          <a className="brand-lockup" href="#overview" aria-label="Gigproof home"><span className="brand-mark" aria-hidden="true">g</span><span className="brand-name">gigproof<span>.</span></span></a>
          <div className="mobile-account-actions">
            <span className="avatar mobile-avatar" aria-label={`Signed in as ${userEmail || 'gig worker'}`}>{initials}</span>
            <button className="mobile-signout" type="button" onClick={onSignOut} disabled={signOutBusy}>
              {signOutBusy ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </header>
        <div className="workspace-inner">
          {isGuest && <GuestBanner />}
          <div className="page-title-row">
            <div>
              <p className="demo-label"><i />SAMPLE DASHBOARD <span>•</span> ILLUSTRATIVE DATA</p>
              <h1>Your income, in perspective.</h1>
              <p className="page-subtitle">A clearer view of what you earn across your work.</p>
            </div>
            <div className="page-actions">
              <button className="button-primary" type="button" onClick={() => setManualOpen(true)}><Icon name="plus" size={17} /> Add income manually</button>
              <PdfExportButton
                profile={{ adjustedMonthlyIncome: sampleAdjustedMonthlyIncome, reliabilityScore: 100, verificationStatus: 'Self-Reported' }}
                months={monthlyIncome}
                isSample
              />
              <button className="button-secondary is-coming-soon" type="button" disabled aria-describedby="connections-coming-soon"><Icon name="links" size={16} /> Connect account <span className="coming-soon-badge">Coming soon</span></button>
            </div>
          </div>

          <section className="summary-band" aria-label="Income summary">
            <div className="summary-main">
              <p className="summary-label">Adjusted monthly income</p>
              <p className="summary-value">{formatCurrency(sampleAdjustedMonthlyIncome)}<span>/mo</span></p>
              <p className="summary-detail"><span className="trend-mark">↗</span> Across 3 income sources <span className="summary-divider">·</span> 12 months</p>
            </div>
            <div className="summary-aside"><span className="summary-aside-label">12-month payouts</span><strong>{formatCurrency(sampleAnnualIncome)}</strong><span className="summary-aside-detail">Oct 2025 — Sep 2026</span></div>
            <div className="summary-aside summary-aside-last"><span className="summary-aside-label">Income months</span><strong>12 <small>/ 12</small></strong><span className="summary-aside-detail">No inactive months</span></div>
          </section>

          <div className="dashboard-grid">
            <IncomeChart />
            <ReliabilityPanel />
            <PayoutActivity />
            <ConnectionsPanel onConnect={() => setConnectOpen(true)} />
          </div>

          <footer className="workspace-footer" id="reports"><span>Proof of income, made clearer.</span><span>Sample figures are illustrative and do not represent a real person.</span></footer>
          {signOutError && <p className="form-error" role="alert">{signOutError}</p>}
        </div>
      </main>
      <ConnectAccountDialog open={connectOpen} onClose={() => setConnectOpen(false)} />
      <ManualEntryDialog open={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [authError, setAuthError] = useState('');
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
      setAuthError('');
      setSignOutError('');
    });

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        setSession(data.session);
        setAuthError(error ? 'Your saved session could not be restored. Please log in again.' : '');
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setAuthError('Gigproof could not reach Supabase authentication. Check your connection and try again.');
        setLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    if (!supabase) return;
    setSignOutBusy(true);
    setSignOutError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setSignOutError('Sign out failed. Please try again.');
    } catch {
      setSignOutError('Sign out failed. Check your connection and try again.');
    } finally {
      setSignOutBusy(false);
    }
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#f5f5f0] text-sm text-[#52645a]" role="status">Checking your session…</main>;
  }
  if (!session) return <Auth initialError={authError} />;

  return (
    <Dashboard
      userEmail={session.user?.email || ''}
      isGuest={session.user?.is_anonymous === true}
      onSignOut={handleSignOut}
      signOutBusy={signOutBusy}
      signOutError={signOutError}
    />
  );
}
