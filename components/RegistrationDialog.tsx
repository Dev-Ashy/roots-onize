'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

type RegistrationDialogProps = {
  open: boolean;
  onClose: () => void;
};

type Step = 'details' | 'payment' | 'receipt' | 'success';

export function RegistrationDialog({ open, onClose }: RegistrationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('details');
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
  const [error, setError] = useState('');
  const [guest, setGuest] = useState({ name: '', email: '', phone: '' });
  const [receiptName, setReceiptName] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setStep('details');
      setStatus('idle');
      setError('');
      dialog.showModal();
      window.requestAnimationFrame(() => nameRef.current?.focus());
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  const submitDetails = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || phone.length < 7) {
      setError('Please enter your full name, valid email, and phone or WhatsApp number.');
      return;
    }

    setError('');
    setStatus('submitting');
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save your reservation.');
      setGuest({ name, email, phone });
      setStep('payment');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Network error. Please try again.');
    } finally {
      setStatus('idle');
    }
  }, []);

  const uploadReceipt = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fileInput = event.currentTarget.elements.namedItem('receipt') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError('Please select an image or PDF receipt.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Receipt files must be smaller than 8 MB.');
      return;
    }

    setError('');
    setStatus('submitting');
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch('/api/rsvp/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: guest.email,
            receiptName: file.name,
            receiptType: file.type,
            receiptData: String(reader.result),
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to upload receipt.');
        setReceiptName(file.name);
        setStep('success');
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Unable to upload receipt.');
      } finally {
        setStatus('idle');
      }
    };
    reader.onerror = () => {
      setError('Unable to read the selected file.');
      setStatus('idle');
    };
    reader.readAsDataURL(file);
  }, [guest.email]);

  const handleClose = () => {
    if (status !== 'submitting') onClose();
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
        <img className="dialog-logo" src="/roots-logo.png" alt="ROOTS by Chef Onize" />
        <button className="dialog-close" type="button" onClick={handleClose} aria-label="Close registration form">×</button>

        {step === 'details' && (
          <>
            <p className="eyebrow dialog-eyebrow">Step 1 of 3 · Guest details</p>
            <h2 id="registration-title" className="dialog-title">Reserve your place</h2>
            <p id="registration-description" className="dialog-description">Join Chef Onize for an intimate 7-course dining experience on December 17.</p>
            <form className="registration-form" onSubmit={submitDetails} noValidate>
              <div className="form-group"><label htmlFor="name" className="form-label">Full name</label><input ref={nameRef} id="name" name="name" type="text" autoComplete="name" required className="form-input" placeholder="Your full name" /></div>
              <div className="form-group"><label htmlFor="registration-email" className="form-label">Email address</label><input id="registration-email" name="email" type="email" autoComplete="email" required className="form-input" placeholder="you@example.com" /></div>
              <div className="form-group"><label htmlFor="phone" className="form-label">Phone / WhatsApp</label><input id="phone" name="phone" type="tel" autoComplete="tel" required className="form-input" placeholder="+234..." /></div>
              {error && <div className="error-container" role="alert"><span aria-hidden="true">!</span><p className="form-error">{error}</p></div>}
              <button className="button button-primary dialog-submit" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Saving...' : 'Continue to payment →'}</button>
            </form>
          </>
        )}

        {step === 'payment' && (
          <>
            <p className="eyebrow dialog-eyebrow">Step 2 of 3 · Payment</p>
            <h2 id="registration-title" className="dialog-title">Complete your payment</h2>
            <p id="registration-description" className="dialog-description">One guest place · ₦120,000</p>
            <div className="payment-card">
              <div><span>Bank</span><strong>Confirmed by ROOTS</strong></div>
              <div><span>Account name</span><strong>Confirmed by ROOTS</strong></div>
              <div><span>Account number</span><strong>Shared before payment</strong></div>
            </div>
            <p className="dialog-note">Official bank details will be sent to {guest.email}. Keep the transfer reference and upload a clear receipt next.</p>
            <button className="button button-primary dialog-submit" type="button" onClick={() => setStep('receipt')}>I&apos;ve made payment →</button>
          </>
        )}

        {step === 'receipt' && (
          <>
            <p className="eyebrow dialog-eyebrow">Step 3 of 3 · Receipt</p>
            <h2 id="registration-title" className="dialog-title">Upload payment receipt</h2>
            <p id="registration-description" className="dialog-description">Upload an image or PDF up to 8 MB. Confirmation is manual until the team verifies your payment.</p>
            <form className="registration-form" onSubmit={uploadReceipt} noValidate>
              <div className="form-group"><label htmlFor="receipt" className="form-label">Receipt file</label><input id="receipt" name="receipt" type="file" accept="image/*,.pdf" className="form-input file-input" required /></div>
              {error && <div className="error-container" role="alert"><span aria-hidden="true">!</span><p className="form-error">{error}</p></div>}
              <button className="button button-primary dialog-submit" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? 'Uploading...' : 'Submit receipt →'}</button>
            </form>
          </>
        )}

        {step === 'success' && (
          <div className="dialog-success" role="status" aria-live="polite">
            <div className="success-orbital" aria-hidden="true" />
            <p className="eyebrow dialog-eyebrow">Reservation received</p>
            <h2 id="registration-title" className="dialog-title">You&apos;re on the list</h2>
            <p id="registration-description" className="dialog-description">Thank you, {guest.name}. Receipt “{receiptName}” was received. The ROOTS team will verify payment and share Abuja location details with confirmed guests.</p>
            <button className="text-button dialog-close-btn" type="button" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </dialog>
  );
}
