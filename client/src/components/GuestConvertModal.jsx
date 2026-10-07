import { useEffect, useRef, useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { supabase } from '../lib/supabase.js';
import Icon from './Icon.jsx';

export default function GuestConvertModal({ open, onClose, onConverted }) {
  const dialogRef = useRef(null);
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setError('');
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        email: email.trim(),
        password,
      });

      if (updateError) throw updateError;

      showToast('Account converted successfully! Your session is permanent.', 'success');
      if (onConverted) onConverted(data?.user);
      onClose();
    } catch (err) {
      const msg = err?.message || 'Could not convert guest account. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      className="connect-dialog convert-account-dialog"
      ref={dialogRef}
      aria-labelledby="convert-dialog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current && !busy) onClose();
      }}
    >
      <div className="dialog-head">
        <div className="dialog-symbol">
          <Icon name="shield" size={20} />
        </div>
        <button
          className="dialog-close"
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          disabled={busy}
        >
          <Icon name="close" size={19} />
        </button>
      </div>

      <h2 id="convert-dialog-title">Save your guest account</h2>
      <p className="dialog-intro">
        Attach an email and password to permanently link your payout history and generated income certificates.
      </p>

      <form className="convert-form" onSubmit={handleSubmit}>
        <label className="form-field" htmlFor="convert-user-email">
          Email address
          <input
            id="convert-user-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="form-field" htmlFor="convert-user-password">
          Password
          <input
            id="convert-user-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <div className="convert-benefits">
          <div className="benefit-item">
            <span className="benefit-bullet">✓</span>
            <span>Retains all manually entered and synced payout records</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-bullet">✓</span>
            <span>Allows continuous export of verified PDF income certificates</span>
          </div>
        </div>

        {error && <p className="form-feedback form-error" role="alert">{error}</p>}

        <div className="dialog-footer-actions">
          <button className="button-primary form-submit" type="submit" disabled={busy}>
            {busy ? 'Saving account…' : 'Save permanent account'}
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
}
