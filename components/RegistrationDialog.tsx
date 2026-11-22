'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type RegistrationDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function RegistrationDialog({ open, onClose }: RegistrationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      setStatus('idle');
      setError('');
      dialog.showModal();
      window.setTimeout(() => nameRef.current?.focus(), 0);
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();

    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter your name and a valid email address to continue.');
      return;
    }

    setError('');
    setStatus('success');
    event.currentTarget.reset();
  }

  return (
    <dialog
      ref={dialogRef}
      className="registration-dialog"
      aria-labelledby="registration-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="dialog-inner">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close registration form">
          ×
        </button>
        {status === 'success' ? (
          <div className="dialog-success" role="status">
            <span className="status-orbit" aria-hidden="true" />
            <p className="eyebrow">Interest registered</p>
            <h2 id="registration-title">You&apos;re on the Lumina list.</h2>
            <p>This local prototype has not stored or emailed your information. Connect a registration provider to activate reservations.</p>
            <button className="text-button" type="button" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Local registration prototype</p>
            <h2 id="registration-title">Your night starts here.</h2>
            <p className="dialog-description">Register your interest for Lumina. No information is stored in this prototype.</p>
            <form className="registration-form" onSubmit={submit} noValidate>
              <label htmlFor="name">Your name</label>
              <input ref={nameRef} id="name" name="name" autoComplete="name" required />
              <label htmlFor="registration-email">Email address</label>
              <input id="registration-email" name="email" type="email" autoComplete="email" required />
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary" type="submit">Save my spot <span aria-hidden="true">↗</span></button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
