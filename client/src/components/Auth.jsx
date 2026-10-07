import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function Auth({ initialError = '' }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const isLogin = mode === 'login';
  const configurationError = supabase
    ? ''
    : 'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the client.';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Gigproof could not connect to Supabase. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings, then restart the client.');
      return;
    }

    setBusy(true);
    try {
      const result = isLogin
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });

      if (result.error) throw result.error;
      if (!isLogin && !result.data.session) {
        setMessage('Check your email for a confirmation link. Once confirmed, you can sign in to view your dashboard.');
      } else if (isLogin) {
        setMessage('Signed in. Loading your dashboard…');
      }
    } catch (authError) {
      const authMessage = authError?.message || 'Authentication could not be completed. Please try again.';
      setError(/invalid login credentials/i.test(authMessage)
        ? 'That email and password do not match. Check them and try again.'
        : authMessage);
    } finally {
      setBusy(false);
    }
  }

  async function handleGuestLogin() {
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Gigproof could not connect to Supabase. Check the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY settings, then restart the client.');
      return;
    }

    setGuestBusy(true);
    try {
      const { error: guestError } = await supabase.auth.signInAnonymously();
      if (guestError) throw guestError;
      setMessage('Guest session started. Loading your dashboard…');
    } catch (guestAuthError) {
      setError(guestAuthError?.message || 'Guest login could not be completed. Please try again.');
    } finally {
      setGuestBusy(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
    setMessage('');
  }

  return (
    <main className="min-h-screen bg-[#f5f5f0] px-5 py-8 text-[#1b2925] sm:px-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <a className="brand-lockup" href="/" aria-label="Gigproof home">
          <span className="brand-mark" aria-hidden="true">g</span>
          <span className="brand-name">gigproof<span>.</span></span>
        </a>
        <span className="hidden text-xs font-medium tracking-[0.12em] text-[#69776e] sm:inline">INCOME, IN PERSPECTIVE</span>
      </div>

      <div className="mx-auto grid min-h-[78vh] w-full max-w-6xl items-center gap-12 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <section className="max-w-2xl">
          <p className="mb-5 text-[10px] font-bold tracking-[0.16em] text-[#718174]">BUILT FOR INDIA’S INDEPENDENT EARNERS</p>
          <h1 className="max-w-xl font-[var(--font-display)] text-5xl font-medium leading-[0.98] tracking-[-0.055em] text-[#193d32] sm:text-6xl lg:text-7xl">
            Your income has a story. Make it easier to show.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#617067] sm:text-lg">
            Bring variable gig earnings into one clear view, then create a proof-of-income report for your next housing or credit application.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 text-xs text-[#536359]">
            <span className="rounded-full border border-[#dce2d8] bg-[#fffefa] px-4 py-2">Monthly income history</span>
            <span className="rounded-full border border-[#dce2d8] bg-[#fffefa] px-4 py-2">Clear verification status</span>
            <span className="rounded-full border border-[#dce2d8] bg-[#fffefa] px-4 py-2">Shareable PDF report</span>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-xl border border-[#e1e5dd] bg-[#fffefa] p-6 shadow-[0_18px_55px_rgba(25,61,50,0.07)] sm:p-9" aria-labelledby="auth-title">
          <p className="mb-2 text-[10px] font-bold tracking-[0.14em] text-[#8a744f]">YOUR GIGPROOF ACCOUNT</p>
          <h2 id="auth-title" className="font-[var(--font-display)] text-3xl font-medium tracking-[-0.035em] text-[#24382e]">
            {isLogin ? 'Welcome back.' : 'Create your account.'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#68766d]">
            {isLogin ? 'Sign in to continue to your income dashboard.' : 'Start organizing your income records in one place.'}
          </p>

          <div className="mt-7 grid grid-cols-2 rounded-lg bg-[#f1f2eb] p-1" role="group" aria-label="Choose login or sign up">
            <button type="button" onClick={() => changeMode('login')} aria-pressed={isLogin}
              className={`rounded-md px-3 py-2.5 text-sm font-semibold transition ${isLogin ? 'bg-white text-[#193d32] shadow-sm' : 'text-[#6d786f] hover:text-[#31483b]'}`}>
              Log in
            </button>
            <button type="button" onClick={() => changeMode('signup')} aria-pressed={!isLogin}
              className={`rounded-md px-3 py-2.5 text-sm font-semibold transition ${!isLogin ? 'bg-white text-[#193d32] shadow-sm' : 'text-[#6d786f] hover:text-[#31483b]'}`}>
              Sign up
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-xs font-semibold text-[#435349]" htmlFor="auth-email">
              Email address
              <input id="auth-email" type="email" autoComplete="email" required value={email}
                onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"
                className="mt-2 min-h-12 w-full rounded-md border border-[#dce2d9] bg-white px-3.5 text-sm font-normal text-[#1b2925] outline-none transition placeholder:text-[#a0a9a1] focus:border-[#587660] focus:ring-2 focus:ring-[#dce8d8]" />
            </label>
            <label className="block text-xs font-semibold text-[#435349]" htmlFor="auth-password">
              Password
              <input id="auth-password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} required minLength={8}
                value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters"
                className="mt-2 min-h-12 w-full rounded-md border border-[#dce2d9] bg-white px-3.5 text-sm font-normal text-[#1b2925] outline-none transition placeholder:text-[#a0a9a1] focus:border-[#587660] focus:ring-2 focus:ring-[#dce8d8]" />
            </label>
            {(error || initialError || configurationError) && <p className="rounded-md bg-[#fbefeb] px-3 py-2.5 text-sm leading-5 text-[#9b4636]" role="alert">{error || initialError || configurationError}</p>}
            {message && <p className="rounded-md bg-[#eef4eb] px-3 py-2.5 text-sm leading-5 text-[#355c43]" role="status">{message}</p>}
            <button type="submit" disabled={busy || guestBusy}
              className="flex min-h-12 w-full items-center justify-center rounded-md bg-[#193d32] px-4 text-sm font-semibold text-[#fffefa] transition hover:bg-[#285443] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a57b45] disabled:cursor-wait disabled:opacity-65">
              {busy ? 'Please wait…' : isLogin ? 'Log in to Gigproof' : 'Create account'}
            </button>
          </form>

          <div className="guest-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={guestBusy || busy}
            className="guest-login-button"
            id="guest-login-btn"
          >
            {guestBusy ? (
              <>
                <span className="guest-spinner" aria-hidden="true" />
                Setting up guest session…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Try it without an account
              </>
            )}
          </button>
          <p className="mt-2 text-center text-[10px] leading-4 text-[#8a9a8e]">No email needed — generate a sample proof of income instantly. Your data won't be saved.</p>

          <p className="mt-5 text-center text-[11px] leading-5 text-[#7a857d]">Your account is secured by Supabase authentication.</p>
        </section>
      </div>
    </main>
  );
}
