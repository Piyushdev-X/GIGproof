import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Auth from './components/Auth.jsx';
import ConnectAccountDialog from './components/ConnectAccountDialog.jsx';
import DashboardSidebar from './components/DashboardSidebar.jsx';
import GuestBanner from './components/GuestBanner.jsx';
import ManualEntryDialog from './components/ManualEntryDialog.jsx';
import { IncomeProvider } from './context/IncomeContext.jsx';
import { supabase } from './lib/supabase.js';
import ConnectionsPage from './pages/ConnectionsPage.jsx';
import IncomeHistoryPage from './pages/IncomeHistoryPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

function DashboardLayout({ session, userEmail, isGuest, onSignOut, signOutBusy, signOutError }) {
  const [connectOpen, setConnectOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const initials = isGuest ? '👤' : (userEmail || 'GW').slice(0, 2).toUpperCase();

  return (
    <IncomeProvider session={session}>
      <div className="app-shell min-h-screen bg-paper text-ink" id="overview">
        <DashboardSidebar
          userEmail={userEmail}
          isGuest={isGuest}
          onSignOut={onSignOut}
          signOutBusy={signOutBusy}
        />
        <main className="workspace-main">
          <header className="mobile-topbar">
            <a className="brand-lockup" href="/" aria-label="Gigproof home">
              <span className="brand-mark" aria-hidden="true">g</span>
              <span className="brand-name">gigproof<span>.</span></span>
            </a>
            <div className="mobile-account-actions">
              <span
                className="avatar mobile-avatar"
                aria-label={`Signed in as ${userEmail || (isGuest ? 'Guest user' : 'gig worker')}`}
              >
                {initials}
              </span>
              <button className="mobile-signout" type="button" onClick={onSignOut} disabled={signOutBusy}>
                {signOutBusy ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </header>

          <div className="workspace-inner">
            {isGuest && <GuestBanner />}

            <Routes>
              <Route
                path="/"
                element={
                  <OverviewPage
                    onOpenManual={() => setManualOpen(true)}
                    onOpenConnect={() => setConnectOpen(true)}
                  />
                }
              />
              <Route path="/overview" element={<Navigate to="/" replace />} />
              <Route
                path="/income-history"
                element={<IncomeHistoryPage onOpenManual={() => setManualOpen(true)} />}
              />
              <Route
                path="/connections"
                element={
                  <ConnectionsPage
                    onOpenManual={() => setManualOpen(true)}
                    onOpenConnect={() => setConnectOpen(true)}
                  />
                }
              />
              <Route
                path="/reports"
                element={<ReportsPage onOpenManual={() => setManualOpen(true)} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <footer className="workspace-footer">
              <span>Proof of income, made clearer.</span>
              <span>Standardized documentation for housing and loans.</span>
            </footer>
            {signOutError && <p className="form-error" role="alert">{signOutError}</p>}
          </div>
        </main>

        <ConnectAccountDialog open={connectOpen} onClose={() => setConnectOpen(false)} />
        <ManualEntryDialog open={manualOpen} onClose={() => setManualOpen(false)} />
      </div>
    </IncomeProvider>
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
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f5f0] text-sm text-[#52645a]" role="status">
        Checking your session…
      </main>
    );
  }

  if (!session) return <Auth initialError={authError} />;

  return (
    <BrowserRouter>
      <DashboardLayout
        session={session}
        userEmail={session.user?.email || ''}
        isGuest={session.user?.is_anonymous === true}
        onSignOut={handleSignOut}
        signOutBusy={signOutBusy}
        signOutError={signOutError}
      />
    </BrowserRouter>
  );
}
