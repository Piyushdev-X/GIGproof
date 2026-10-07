import { useEffect, useRef, useState } from 'react';
import { useIncome } from '../context/IncomeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { supabase } from '../lib/supabase.js';
import Icon from './Icon.jsx';

const platformOptions = ['Zomato', 'Swiggy', 'Ola', 'Uber', 'Urban Company', 'Blinkit', 'Zepto', 'Upwork', 'Other'];

export default function ManualEntryDialog({ open, onClose, initialPlatform = '' }) {
  const dialogRef = useRef(null);
  const { addPayout } = useIncome();
  const { showToast } = useToast();
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [platform, setPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle open state and context-aware platform pre-fill
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setError('');
      setSuccess('');
      setDate(new Date().toISOString().slice(0, 10));

      if (initialPlatform) {
        if (platformOptions.includes(initialPlatform)) {
          setPlatform(initialPlatform);
          setCustomPlatform('');
        } else {
          setPlatform('Other');
          setCustomPlatform(initialPlatform);
        }
      } else {
        setPlatform('');
        setCustomPlatform('');
      }

      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialPlatform]);

  function resetForm() {
    setDate('');
    setAmount('');
    setPlatform('');
    setCustomPlatform('');
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const sourcePlatform = (platform === 'Other' ? customPlatform : platform).trim();
    if (!sourcePlatform) {
      setError('Choose or enter the platform that paid you.');
      return;
    }

    setBusy(true);
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const session = data.session;
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('Sign in to save an income entry.');

      const newEntry = {
        id: `entry-${Date.now()}`,
        payoutDate: date,
        amount: Number(amount),
        platform: sourcePlatform,
        is_verified: false,
        source_type: 'manual',
      };

      // 1. Instant reactivity: update local context state immediately
      addPayout(newEntry);

      // 2. Persist to API / Supabase in background
      let saved = false;
      try {
        const response = await fetch('/api/income/manual', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ payoutDate: date, amount: Number(amount), platform: sourcePlatform }),
        });
        if (response.ok) {
          saved = true;
        } else if (response.status === 401) {
          throw new Error('Sign in to save an income entry.');
        }
      } catch (fetchErr) {
        if (fetchErr.message === 'Sign in to save an income entry.') throw fetchErr;
        console.warn('API unreachable, using direct Supabase fallback:', fetchErr);
      }

      if (!saved) {
        const user = session.user;
        const userId = user.id;
        const userEmail = user.email || `${userId}@anonymous.gigproof`;

        // Ensure user row exists in public.users
        await supabase.from('users').upsert(
          { id: userId, email: userEmail },
          { onConflict: 'id', ignoreDuplicates: true }
        );

        // Find or create connection
        const { data: existingConnection, error: lookupErr } = await supabase
          .from('gig_connections')
          .select('id')
          .eq('user_id', userId)
          .eq('platform', sourcePlatform)
          .maybeSingle();
        if (lookupErr) throw new Error(lookupErr.message);

        let connectionId = existingConnection?.id;
        if (!connectionId) {
          const { data: newConnection, error: connErr } = await supabase
            .from('gig_connections')
            .insert({ user_id: userId, platform: sourcePlatform, status: 'manual' })
            .select('id')
            .single();
          if (connErr) throw new Error(connErr.message);
          connectionId = newConnection.id;
        }

        // Insert payout record
        const { error: payoutErr } = await supabase
          .from('income_payouts')
          .insert({
            connection_id: connectionId,
            payout_date: date,
            amount: Number(amount),
            is_verified: false,
            source_type: 'manual',
          });
        if (payoutErr) throw new Error(payoutErr.message);
      }

      setSuccess('Income payout added as self-reported.');
      showToast(`Added ₹${Number(amount).toLocaleString('en-IN')} payout from ${sourcePlatform}.`, 'success');
      window.setTimeout(() => {
        resetForm();
        onClose();
      }, 500);
    } catch (submitError) {
      const msg = submitError.message || 'Unable to save income entry. Try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      className="connect-dialog manual-entry-dialog"
      ref={dialogRef}
      aria-labelledby="manual-entry-title"
      onClose={() => {
        resetForm();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !busy) dialogRef.current.close();
      }}
    >
      <div className="dialog-head">
        <div className="dialog-symbol">
          <Icon name="plus" size={20} />
        </div>
        <button
          className="dialog-close"
          type="button"
          onClick={() => dialogRef.current.close()}
          aria-label="Close dialog"
          disabled={busy}
        >
          <Icon name="close" size={19} />
        </button>
      </div>
      <h2 id="manual-entry-title">Add income manually</h2>
      <p className="dialog-intro">
        {initialPlatform
          ? `Record a direct earnings payout received from ${initialPlatform}.`
          : 'Enter a payout you received. Manual entries are marked as self-reported.'}
      </p>
      <form className="manual-entry-form" onSubmit={handleSubmit}>
        <label className="form-field" htmlFor="manual-payout-date">
          Date received
          <input
            id="manual-payout-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            max={new Date().toISOString().slice(0, 10)}
          />
        </label>
        <label className="form-field" htmlFor="manual-payout-amount">
          Amount (INR)
          <span className="amount-input-wrap">
            <span aria-hidden="true">₹</span>
            <input
              id="manual-payout-amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="10000000"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </span>
        </label>
        <label className="form-field" htmlFor="manual-payout-platform">
          Source / platform
          <select
            id="manual-payout-platform"
            value={platform}
            onChange={(event) => setPlatform(event.target.value)}
            required
          >
            <option value="" disabled>Select a source</option>
            {platformOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        {platform === 'Other' && (
          <label className="form-field" htmlFor="manual-payout-custom-platform">
            Platform name
            <input
              id="manual-payout-custom-platform"
              type="text"
              maxLength={80}
              value={customPlatform}
              onChange={(event) => setCustomPlatform(event.target.value)}
              placeholder="e.g. Swiggy, Dunzo, Direct Client"
              required
            />
          </label>
        )}
        <p className="manual-entry-note">
          <Icon name="shield" size={15} /> This entry will be stored as unverified self-reported income.
        </p>
        {error && <p className="form-feedback form-error" role="alert">{error}</p>}
        {success && <p className="form-feedback form-success" role="status">{success}</p>}
        <button className="button-primary form-submit" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save income entry'}
        </button>
      </form>
    </dialog>
  );
}
