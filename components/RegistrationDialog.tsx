'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

type RegistrationDialogProps = {
  open: boolean;
  onClose: () => void;
};

type ApiResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export function RegistrationDialog({ open, onClose }: RegistrationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      setStatus('idle');
      setError('');
      dialog.showModal();
      // Focus name field after dialog opens
      window.requestAnimationFrame(() => nameRef.current?.focus());
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();

    // Validation
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter your full name and a valid email address.');
      return;
    }

    setError('');
    setStatus('submitting');

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const result: ApiResult = await response.json();

      if (!response.ok) {
        setError(result.error || 'Something went wrong. Please try again.');
        setStatus('idle');
        return;
      }

      setStatus('success');
      event.currentTarget.reset();
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setStatus('idle');
    }
  }, []);

  const handleClose = () => {
    if (status !== 'success') onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="registration-dialog"
      aria-labelledby="registration-title"
      aria-describedby="registration-description"
      onCancel={handleClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) handleClose();
      }}
    >
      <div className="dialog-inner">
        <button
          className="dialog-close"
          type="button"
          onClick={handleClose}
          aria-label="Close registration form"
          title="Close"
        >
          ×
        </button>

        {status === 'success' ? (
          <div className="dialog-success" role="status" aria-live="polite">
            <div className="success-orbital" aria-hidden="true" />
            <p className="eyebrow dialog-eyebrow">Confirmation</p>
            <h2 id="registration-title" className="dialog-title">We&apos;ve received your RSVP.</h2>
            <p id="registration-description" className="dialog-description">
              Thank you for your interest in ROOTS by Chef Onize. Your registration has been received.
              We&apos;ll contact you shortly with payment instructions and confirmation details.
            </p>
            <button
              className="text-button dialog-close-btn"
              type="button"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow dialog-eyebrow">Begin your reservation</p>
            <h2 id="registration-title" className="dialog-title">Create your account</h2>
            <p id="registration-description" className="dialog-description">
              Enter your details to begin the reservation process for ROOTS by Chef Onize.
            </p>
            <form className="registration-form" onSubmit={submit} noValidate>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={status === 'submitting'}
                  aria-required="true"
                  className="form-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="registration-email" className="form-label">
                  Email Address
                </label>
                <input
                  ref={emailRef}
                  id="registration-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={status === 'submitting'}
                  aria-required="true"
                  className="form-input"
                  placeholder="john@example.com"
                />
              </div>

              {error && (
                <div className="error-container" role="alert" aria-live="assertive">
                  <span className="error-icon" aria-hidden="true">⚠</span>
                  <p className="form-error">{error}</p>
                </div>
              )}

              <button
                className="button button-primary"
                type="submit"
                disabled={status === 'submitting'}
                aria-busy={status === 'submitting'}
                aria-label={status === 'submitting' ? 'Submitting reservation' : 'Submit reservation'}
              >
                {status === 'submitting' ? (
                  <>
                    <span className="loading-spinner" aria-hidden="true" />
                    Processing your reservation...
                  </>
                ) : (
                  'Continue →'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}