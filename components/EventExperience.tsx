'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

type Step = 0 | 1 | 2 | 3 | 4;

const stepLabels = ['Welcome', 'Details', 'Payment', 'Receipt', 'Complete'];

const bankDetails = {
  bank: process.env.NEXT_PUBLIC_ROOTS_BANK || 'Bank details coming soon',
  name: process.env.NEXT_PUBLIC_ROOTS_ACCOUNT_NAME || 'ROOTS by Chef Onize',
  number: process.env.NEXT_PUBLIC_ROOTS_ACCOUNT_NUMBER || 'Pending',
};

export function EventExperience() {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [error, setError] = useState('');
  const [assistant, setAssistant] = useState('Welcome! I’ll guide you through each step.');
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const helperByStep: Record<Step, string> = {
    0: 'Welcome! I’ll guide you through each step.',
    1: 'Let’s start with your name, email, and WhatsApp number.',
    2: 'Please transfer ₦120,000 using the details below.',
    3: 'Upload a clear image or PDF of your transfer receipt.',
    4: 'Your reservation has been received. We’ll take it from here.',
  };

  function goTo(nextStep: Step) {
    setError('');
    setAssistant(helperByStep[nextStep]);
    setStep(nextStep);
  }

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      setAssistant('Please enter your full name so we know what to call you.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      setAssistant('That email needs a little check. Please enter a complete email address.');
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 7) {
      setError('Please enter your WhatsApp or phone number.');
      setAssistant('Please enter your WhatsApp number so the team can reach you.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, phone: cleanPhone }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not save your details.');
      goTo(2);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Please try again.';
      setError(message);
      setAssistant('Something went wrong, but we can try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function chooseReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError('');
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setReceipt(null);
      setReceiptPreview('');
      setError('Please choose a file smaller than 8 MB.');
      setAssistant('That file is a little large. Please choose an image or PDF under 8 MB.');
      return;
    }
    setReceipt(file);
    setAssistant('Nice! Select “Submit receipt” when you’re ready.');
    setReceiptPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
  }

  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    };
  }, [receiptPreview]);

  async function submitReceipt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!receipt) {
      setError('Please upload your payment receipt.');
      setAssistant('Please choose your receipt photo or PDF before continuing.');
      return;
    }

    setSubmitting(true);
    setError('');
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch('/api/rsvp/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            receiptName: receipt.name,
            receiptType: receipt.type,
            receiptData: String(reader.result),
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'We could not upload your receipt.');
        goTo(4);
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : 'Please try again.';
        setError(message);
        setAssistant('The receipt did not go through. Please try once more.');
      } finally {
        setSubmitting(false);
      }
    };
    reader.onerror = () => {
      setError('We could not read that file. Please choose it again.');
      setAssistant('Please choose the receipt again.');
      setSubmitting(false);
    };
    reader.readAsDataURL(receipt);
  }

  async function copyAccountNumber() {
    if (!/^\d+$/.test(bankDetails.number.replace(/\s/g, ''))) return;
    await navigator.clipboard.writeText(bankDetails.number.replace(/\s/g, ''));
    setAssistant('Account number copied. You can now paste it into your bank app.');
  }

  return (
    <main className="onboarding-shell">
      <a className="skip-link" href="#onboarding-card">Skip onboarding</a>
      <header className="onboarding-header">
        <img className="roots-logo" src="/roots-logo.png" alt="ROOTS by Chef Onize" />
        <div className="step-count" aria-label={`Step ${step + 1} of ${stepLabels.length}`}>
          <span>{String(step + 1).padStart(2, '0')}</span>
          <i aria-hidden="true" />
          <span>{String(stepLabels.length).padStart(2, '0')}</span>
        </div>
      </header>

      <section className="onboarding-layout" aria-live="polite">
        <div className="progress-track" aria-label="Onboarding progress">
          {stepLabels.map((label, index) => (
            <div className={index <= step ? 'progress-step is-active' : 'progress-step'} key={label}>
              <span>{index < step ? '✓' : index + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>

        <div className="onboarding-card" id="onboarding-card">
          <aside className="onboarding-visual" aria-hidden={step === 1}>
            {step === 0 ? (
              <img src="/clay-vessel-nigerian-dining.jpg" alt="" />
            ) : (
              <img src="/clay-vessel-nigerian-dining.jpg" alt="" />
            )}
            {step === 0 && (
              <div className="welcome-stamp">
                <span>December 17</span>
                <strong>Abuja</strong>
              </div>
            )}
          </aside>

          <div className="onboarding-content" key={step}>
            {step === 0 && (
              <>
                <p className="onboarding-eyebrow">7-course intimate dining</p>
                <h1 ref={headingRef} tabIndex={-1}>A place at<br /><em>the table.</em></h1>
                <p className="onboarding-lead">Join ROOTS by Chef Onize for an intimate evening of African flavours, warm company, and good food.</p>
                <div className="event-facts">
                  <div><span>Date</span><strong>December 17</strong></div>
                  <div><span>Service</span><strong>6 PM · Dinner 7 PM</strong></div>
                  <div><span>For one guest</span><strong>₦120,000</strong></div>
                </div>
                <button className="primary-action" type="button" onClick={() => goTo(1)}>Let’s begin <span aria-hidden="true">→</span></button>
              </>
            )}

            {step === 1 && (
              <>
                <p className="onboarding-eyebrow">Your reservation</p>
                <h1 ref={headingRef} tabIndex={-1}>Tell us<br /><em>about you.</em></h1>
                <form className="onboarding-form" onSubmit={submitDetails} noValidate>
                  <div className="field">
                    <label htmlFor="guest-name">Full name</label>
                    <input id="guest-name" name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your full name" />
                  </div>
                  <div className="field">
                    <label htmlFor="guest-email">Email address</label>
                    <input id="guest-email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" />
                  </div>
                  <div className="field">
                    <label htmlFor="guest-phone">WhatsApp / phone number</label>
                    <input id="guest-phone" name="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="+234..." />
                  </div>
                  {error && <p className="form-error" role="alert">{error}</p>}
                  <button className="primary-action" type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Continue to payment'} <span aria-hidden="true">→</span></button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <p className="onboarding-eyebrow">Step 3 · Make payment</p>
                <h1 ref={headingRef} tabIndex={-1}>Transfer<br /><em>₦120,000.</em></h1>
                <div className="bank-card">
                  <div><span>Bank name</span><strong>{bankDetails.bank}</strong></div>
                  <div><span>Account name</span><strong>{bankDetails.name}</strong></div>
                  <div className="account-row"><div><span>Account number</span><strong>{bankDetails.number}</strong></div>{/^\d+$/.test(bankDetails.number.replace(/\s/g, '')) && <button type="button" onClick={copyAccountNumber}>Copy</button>}</div>
                </div>
                <p className="bank-note">Use your name or reservation name as the transfer reference, then keep the receipt.</p>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="primary-action" type="button" onClick={() => goTo(3)}>I’ve made the transfer <span aria-hidden="true">→</span></button>
              </>
            )}

            {step === 3 && (
              <>
                <p className="onboarding-eyebrow">Step 4 · Upload receipt</p>
                <h1 ref={headingRef} tabIndex={-1}>Share your<br /><em>receipt.</em></h1>
                <form className="onboarding-form" onSubmit={submitReceipt} noValidate>
                  <label className={receipt ? 'upload-box is-ready' : 'upload-box'} htmlFor="receipt">
                    {receiptPreview ? <img src={receiptPreview} alt="Selected receipt preview" /> : <span className="upload-icon" aria-hidden="true">↑</span>}
                    <strong>{receipt ? receipt.name : 'Choose receipt'}</strong>
                    <small>{receipt ? 'Ready to submit' : 'Image or PDF · up to 8 MB'}</small>
                  </label>
                  <input id="receipt" className="visually-hidden" type="file" accept="image/*,.pdf" onChange={chooseReceipt} />
                  {error && <p className="form-error" role="alert">{error}</p>}
                  <button className="primary-action" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit receipt'} <span aria-hidden="true">→</span></button>
                </form>
              </>
            )}

            {step === 4 && (
              <div className="complete-state">
                <div className="complete-mark" aria-hidden="true">✓</div>
                <p className="onboarding-eyebrow">Reservation received</p>
                <h1 ref={headingRef} tabIndex={-1}>You’re on<br /><em>the list.</em></h1>
                <p className="onboarding-lead">Thank you, {name}. We’ll verify your payment and share the confirmed guest details with you.</p>
                <div className="next-step"><span>What happens next?</span><strong>The team will confirm your place privately.</strong></div>
                <button className="secondary-action" type="button" onClick={() => window.location.reload()}>Finish</button>
              </div>
            )}
          </div>

          <aside className="helper" aria-label="ROOTS guide">
            <div className="helper-avatar" aria-hidden="true"><span>R</span></div>
            <div><small>Your guide</small><p>{assistant}</p></div>
          </aside>
        </div>
      </section>
    </main>
  );
}
