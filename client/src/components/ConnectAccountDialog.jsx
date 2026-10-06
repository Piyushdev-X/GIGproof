import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

const providers = [
  { name: 'Argyle', detail: 'Connect payroll and work platforms', mark: 'A', tone: 'argyle' },
  { name: 'Plaid', detail: 'Connect a bank account', mark: 'P', tone: 'plaid' },
];

export default function ConnectAccountDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog className="connect-dialog" ref={dialogRef} aria-labelledby="connect-dialog-title"
      onClose={onClose}
      onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current.close(); }}>
      <div className="dialog-head">
        <div className="dialog-symbol"><Icon name="links" size={20} /></div>
        <button className="dialog-close" type="button" onClick={() => dialogRef.current.close()} aria-label="Close dialog"><Icon name="close" size={19} /></button>
      </div>
      <h2 id="connect-dialog-title">Account connections are coming soon</h2>
      <p className="dialog-intro">Automatic income syncing is being prepared. You can add a payout yourself in the meantime.</p>
      <div className="provider-options">
        {providers.map((provider) => <div className="provider-option provider-option-disabled" key={provider.name}>
          <span className={`provider-mark ${provider.tone}`}>{provider.mark}</span><span className="provider-copy"><strong>{provider.name}</strong><small>{provider.detail}</small></span><span className="coming-soon-badge">Coming soon</span>
        </div>)}
      </div>
      <p className="dialog-privacy"><Icon name="shield" size={16} /> Your income data stays private to your account.</p>
    </dialog>
  );
}
