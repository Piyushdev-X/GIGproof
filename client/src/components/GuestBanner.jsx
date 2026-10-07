import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function GuestBanner({ onConverted }) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleConvert(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: email.trim(),
        password,
      });

      if (updateError) throw updateError;

      setSuccess('Account created! Check your email to confirm, then you\u2019re all set.');
      setShowForm(false);
      if (onConverted) onConverted();
    } catch (convertError) {
      setError(convertError?.message || 'Could not create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="guest-banner" role="alert" id="guest-banner">
      <div className="guest-banner-inner">
        <div className="guest-banner-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div className="guest-banner-copy">
          <p className="guest-banner-text">
            <strong>You're using a guest account.</strong> Your data will be lost when you sign out.
          </p>
          {success && <p className="guest-banner-success">{success}</p>}
          {!showForm && !success && (
            <button
              type="button"
              className="guest-banner-cta"
              onClick={() => setShowForm(true)}
              id="guest-convert-btn"
            >
              Create a permanent account →
            </button>
          )}
        </div>
        <button
          type="button"
          className="guest-banner-dismiss"
          onClick={(e) => e.currentTarget.closest('.guest-banner').style.display = 'none'}
          aria-label="Dismiss banner"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {showForm && (
        <form className="guest-convert-form" onSubmit={handleConvert} id="guest-convert-form">
          <div className="guest-convert-fields">
            <label className="guest-convert-label" htmlFor="convert-email">
              Email
              <input
                id="convert-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="guest-convert-input"
              />
            </label>
            <label className="guest-convert-label" htmlFor="convert-password">
              Password
              <input
                id="convert-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="guest-convert-input"
              />
            </label>
          </div>
          {error && <p className="guest-convert-error" role="alert">{error}</p>}
          <div className="guest-convert-actions">
            <button type="submit" disabled={busy} className="guest-convert-submit">
              {busy ? 'Creating account…' : 'Save my account'}
            </button>
            <button type="button" className="guest-convert-cancel" onClick={() => { setShowForm(false); setError(''); }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
