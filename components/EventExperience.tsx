'use client';

import { upload } from '@vercel/blob/client';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';

type Step = 0 | 1 | 2 | 3 | 4;
type PaymentDetails = { bank: string; name: string; number: string };

const stepLabels = ['Welcome', 'Details', 'Transfer', 'Receipt', 'Review'];
const imageSlides = [
  { src: '/clay-vessel-nigerian-dining.jpg', alt: 'A plated dish in a handmade clay vessel', kind: 'photo' },
  { src: '/invitation-card-clay-vessel.jpg', alt: 'ROOTS invitation card beside a clay vessel', kind: 'photo' },
  { src: '/roots-wordmark.png', alt: 'ROOTS by Chef Onize', kind: 'brand' },
  { src: '/haven-royale-wordmark.png', alt: 'Haven Royale by Prinoni', kind: 'brand' },
] as const;

const helperByStep: Record<Step, string> = {
  0: 'Welcome! I’ll guide you through each step.',
  1: 'Tell us who is joining and share any food preferences we should know about.',
  2: 'Check the ROOTS account details, then make your transfer.',
  3: 'Upload a clear image or PDF of your transfer receipt.',
  4: 'Your receipt is pending review. Your place is confirmed only after the team verifies payment.',
};

const allowedReceiptTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

function getReceiptType(file: File) {
  if (allowedReceiptTypes.has(file.type)) return file.type;
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return 'application/pdf';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return '';
}

export function EventExperience() {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [uploadToken, setUploadToken] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptType, setReceiptType] = useState('');
  const [receiptPreview, setReceiptPreview] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideshowPaused, setSlideshowPaused] = useState(false);
  const [error, setError] = useState('');
  const [assistant, setAssistant] = useState(helperByStep[0]);
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (slideshowPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % imageSlides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slideshowPaused]);

  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    };
  }, [receiptPreview]);

  function goTo(nextStep: Step) {
    setError('');
    setAssistant(helperByStep[nextStep]);
    setStep(nextStep);
  }

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanInstagram = instagram.trim().replace(/^@/, '');
    const cleanDietaryRestrictions = dietaryRestrictions.trim();

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
    if (!cleanInstagram) {
      setError('Please enter your Instagram username.');
      setAssistant('Please add your Instagram username so we can connect with you.');
      return;
    }
    if (!/^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._]{0,28}[A-Za-z0-9])?$/.test(cleanInstagram)) {
      setError('Please enter a valid Instagram username.');
      setAssistant('Please add your Instagram username so we can connect with you.');
      return;
    }
    if (cleanDietaryRestrictions.length > 500) {
      setError('Please keep your dietary notes under 500 characters.');
      setAssistant('Please shorten your dietary notes so the team can review them easily.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const detailsResponse = await fetch('/api/payment/details', { cache: 'no-store' });
      const detailsResult = await detailsResponse.json();
      if (!detailsResponse.ok || !detailsResult.configured) {
        throw new Error(detailsResult.error || 'Payment details are not available yet.');
      }

      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          instagram: `@${cleanInstagram}`,
          dietaryRestrictions: cleanDietaryRestrictions,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not save your details.');
      setName(cleanName);
      setEmail(cleanEmail);
      setPhone(cleanPhone);
      setInstagram(`@${cleanInstagram}`);
      setDietaryRestrictions(cleanDietaryRestrictions);
      setUploadToken(result.uploadToken);
      setPaymentDetails(detailsResult.details);
      goTo(2);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Please try again.';
      setError(message);
      setAssistant(message);
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
      setReceiptType('');
      setReceiptPreview('');
      setError('Please choose a file smaller than 8 MB.');
      setAssistant('That file is a little large. Please choose an image or PDF under 8 MB.');
      return;
    }
    const type = getReceiptType(file);
    if (!type) {
      setReceipt(null);
      setReceiptType('');
      setReceiptPreview('');
      setError('Please choose a JPG, PNG, WebP, or PDF receipt.');
      setAssistant('That file type won’t work. Please choose a JPG, PNG, WebP, or PDF.');
      return;
    }
    setReceipt(file);
    setReceiptType(type);
    setAssistant('Nice! Select “Submit receipt” when you’re ready.');
    setReceiptPreview(type.startsWith('image/') ? URL.createObjectURL(file) : '');
  }

  async function submitReceipt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!receipt || !receiptType) {
      setError('Please upload your payment receipt.');
      setAssistant('Please choose your receipt photo or PDF before continuing.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      let response: Response;
      if (process.env.NODE_ENV === 'development') {
        const formData = new FormData();
        formData.set('email', email);
        formData.set('uploadToken', uploadToken);
        formData.set('receipt', receipt);
        response = await fetch('/api/rsvp/receipt/local', { method: 'POST', body: formData });
      } else {
        const safeName = receipt.name.replace(/[^\w.-]+/g, '-').slice(-120);
        const pathname = `roots/receipts/${crypto.randomUUID()}-${safeName}`;
        const blob = await upload(pathname, receipt, {
          access: 'private',
          contentType: receiptType,
          handleUploadUrl: '/api/rsvp/receipt',
          clientPayload: JSON.stringify({ email, uploadToken }),
        });
        response = await fetch('/api/rsvp/receipt/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            uploadToken,
            pathname: blob.pathname,
            receiptName: receipt.name,
            receiptType,
          }),
        });
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not save your receipt.');
      goTo(4);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Please try again.';
      setError(message);
      setAssistant('The receipt did not go through. Please try once more.');
    } finally {
      setSubmitting(false);
    }
  }

  async function copyAccountNumber() {
    if (!paymentDetails) return;
    try {
      await navigator.clipboard.writeText(paymentDetails.number);
      setAssistant('Account number copied. You can paste it into your bank app.');
    } catch {
      setError('Copy was unavailable. Please select and copy the account number.');
      setAssistant('You can still select the account number and copy it manually.');
    }
  }

  return (
    <main className="onboarding-shell">
      <a className="skip-link" href="#onboarding-card">Skip onboarding</a>
      <header className="onboarding-header">
        <img className="roots-logo" src="/roots-wordmark.png" alt="ROOTS by Chef Onize" />
        <div className="step-count" aria-label={`Step ${step + 1} of ${stepLabels.length}`}>
          <span>{String(step + 1).padStart(2, '0')}</span><i aria-hidden="true" /><span>{String(stepLabels.length).padStart(2, '0')}</span>
        </div>
      </header>

      <section className="onboarding-layout" aria-live="polite">
        <div className="progress-track" aria-label="Onboarding progress">
          {stepLabels.map((label, index) => (
            <div className={index <= step ? 'progress-step is-active' : 'progress-step'} key={label}>
              <span>{index < step ? '✓' : index + 1}</span><small>{label}</small>
            </div>
          ))}
        </div>

        <div className={`onboarding-card ${step === 1 ? 'is-details-step' : ''}`} id="onboarding-card">
          <aside className={`onboarding-visual ${imageSlides[activeSlide].kind === 'brand' ? 'is-brand-slide' : ''}`} aria-label="ROOTS event images">
            {imageSlides.map((slide, index) => (
              <img
                key={slide.src}
                className={`visual-slide ${index === activeSlide ? 'is-visible' : ''}`}
                src={slide.src}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            ))}
            <div className="welcome-stamp"><span>December 17</span><strong>Abuja</strong></div>
            {imageSlides.length > 1 && (
              <button
                className="slideshow-toggle"
                type="button"
                aria-label={slideshowPaused ? 'Play image slideshow' : 'Pause image slideshow'}
                onClick={() => setSlideshowPaused((paused) => !paused)}
              >
                {slideshowPaused ? 'Play' : 'Pause'}
              </button>
            )}
          </aside>

          <div className={`onboarding-content ${step === 1 ? 'is-details-step' : ''}`} key={step}>
            {step === 0 && (
              <>
                <p className="onboarding-eyebrow">7-course intimate dining</p>
                <h1 ref={headingRef} tabIndex={-1}>A place at<br /><em>the table.</em></h1>
                <p className="onboarding-lead">Join ROOTS by Chef Onize for an intimate evening of African flavours, warm company, and good food.</p>
                <div className="event-facts">
                  <div><span>Date</span><strong>December 17</strong></div>
                  <div><span>Service</span><strong>Arrival 6 PM · Dinner 7 PM</strong></div>
                  <div><span>For one guest</span><strong>₦120,000</strong></div>
                </div>
                <div className="event-location">
                  <span>Location</span>
                  <strong>Abuja</strong>
                  <small>Exact venue shared after payment is verified.</small>
                </div>
                <button className="primary-action" type="button" onClick={() => goTo(1)}>Let’s begin <span aria-hidden="true">→</span></button>
              </>
            )}

            {step === 1 && (
              <>
                <p className="onboarding-eyebrow">Your reservation</p>
                <h1 ref={headingRef} tabIndex={-1}>Reserve your<br /><em>spot.</em></h1>
                <p className="onboarding-lead">We’d love to know who’s joining us.</p>
                <form className="onboarding-form guest-details-form" onSubmit={submitDetails} noValidate>
                  <div className="field"><label htmlFor="guest-name">Full name <span aria-hidden="true">*</span></label><input id="guest-name" name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your full name" aria-required="true" /></div>
                  <div className="field"><label htmlFor="guest-email">Email address <span aria-hidden="true">*</span></label><input id="guest-email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" aria-required="true" /></div>
                  <div className="field"><label htmlFor="guest-phone">Phone number <span aria-hidden="true">*</span></label><input id="guest-phone" name="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="+234..." aria-required="true" /></div>
                  <div className="field">
                    <label htmlFor="guest-instagram">Instagram <span aria-hidden="true">*</span></label>
                    <input id="guest-instagram" name="instagram" value={instagram} onChange={(event) => setInstagram(event.target.value)} autoComplete="off" placeholder="@yourusername" aria-required="true" />
                    <small className="field-hint">We’d love to connect with you.</small>
                  </div>
                  <div className="field dietary-field">
                    <label htmlFor="guest-dietary">Do you have any dietary restrictions, allergies, or preferences we should know about? <span className="optional-label">Optional</span></label>
                    <textarea id="guest-dietary" name="dietaryRestrictions" value={dietaryRestrictions} onChange={(event) => setDietaryRestrictions(event.target.value)} maxLength={500} placeholder="Share any food allergies or preferences" />
                  </div>
                  {error && <p className="form-error" role="alert">{error}</p>}
                  <button className="primary-action" type="submit" disabled={submitting}>{submitting ? 'Preparing your next step…' : 'Next'} <span aria-hidden="true">→</span></button>
                </form>
              </>
            )}

            {step === 2 && paymentDetails && (
              <>
                <p className="onboarding-eyebrow">Step 3 · Transfer</p>
                <h1 ref={headingRef} tabIndex={-1}>Transfer<br /><em>₦120,000.</em></h1>
                <p className="transfer-method">Please transfer to the ROOTS account below.</p>
                <div className="bank-card">
                  <div><span>Receiving bank</span><strong>{paymentDetails.bank}</strong></div>
                  <div><span>Account name</span><strong>{paymentDetails.name}</strong></div>
                  <div className="account-row"><div><span>Account number</span><strong>{paymentDetails.number}</strong></div><button type="button" onClick={copyAccountNumber}>Copy</button></div>
                </div>
                <p className="bank-note">Check the name and amount before confirming the transfer. Keep your receipt for the next step.</p>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="primary-action" type="button" onClick={() => goTo(3)}>I’ve made the transfer <span aria-hidden="true">→</span></button>
              </>
            )}

            {step === 3 && (
              <>
                <p className="onboarding-eyebrow">Step 4 · Upload receipt</p>
                <h1 ref={headingRef} tabIndex={-1}>Share your<br /><em>receipt.</em></h1>
                <p className="onboarding-lead upload-intro">This lets our team check your payment. Your seat is not confirmed until payment is verified.</p>
                <form className="onboarding-form" onSubmit={submitReceipt} noValidate>
                  <label className={receipt ? 'upload-box is-ready' : 'upload-box'} htmlFor="receipt">
                    {receiptPreview ? <img src={receiptPreview} alt="Selected receipt preview" /> : <span className="upload-icon" aria-hidden="true">↑</span>}
                    <strong>{receipt ? receipt.name : 'Choose receipt'}</strong>
                    <small>{receipt ? 'Ready to submit' : 'JPG, PNG, WebP, or PDF · up to 8 MB'}</small>
                  </label>
                  <input id="receipt" className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={chooseReceipt} />
                  {error && <p className="form-error" role="alert">{error}</p>}
                  <button className="primary-action" type="submit" disabled={submitting}>{submitting ? 'Uploading securely…' : 'Submit receipt'} <span aria-hidden="true">→</span></button>
                </form>
              </>
            )}

            {step === 4 && (
              <div className="complete-state">
                <div className="complete-mark" aria-hidden="true">✓</div>
                <p className="onboarding-eyebrow">Receipt received</p>
                <h1 ref={headingRef} tabIndex={-1}>Payment<br /><em>review pending.</em></h1>
                <p className="onboarding-lead">Thank you, {name}. The ROOTS team will review your receipt and contact you when your payment has been checked.</p>
                <div className="next-step"><span>Important</span><strong>Your seat is not confirmed until an admin verifies your payment.</strong></div>
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
