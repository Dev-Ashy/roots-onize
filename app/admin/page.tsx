'use client';

import { FormEvent, useEffect, useState } from 'react';

type Submission = {
  name: string;
  email: string;
  phone: string;
  selectedBank: string | null;
  paymentStatus: 'Pending' | 'Verified';
  receiptName?: string;
  hasReceipt: boolean;
};

export default function AdminDashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [workingEmail, setWorkingEmail] = useState('');
  const [error, setError] = useState('');

  async function loadSubmissions() {
    const response = await fetch('/api/admin/guests', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to load guest reservations.');
    setSubmissions(data.submissions);
  }

  useEffect(() => {
    if (!signedIn) return;
    setLoading(true);
    loadSubmissions()
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Unable to load guest reservations.'))
      .finally(() => setLoading(false));
  }, [signedIn]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Email or password is incorrect.');
      setPassword('');
      setSignedIn(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyPayment(guestEmail: string) {
    setWorkingEmail(guestEmail);
    setError('');
    try {
      const response = await fetch(`/api/admin/guests/${encodeURIComponent(guestEmail)}`, { method: 'PATCH' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to verify payment.');
      await loadSubmissions();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to verify payment.');
    } finally {
      setWorkingEmail('');
    }
  }

  async function signOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setSignedIn(false);
    setSubmissions([]);
  }

  if (!signedIn) {
    return (
      <main className="admin-page">
        <div className="admin-login">
          <img src="/roots-wordmark.png" alt="ROOTS by Chef Onize" />
          <p className="admin-eyebrow">Private access</p>
          <h1>Guest dashboard</h1>
          <p className="admin-intro">Sign in with an approved ROOTS admin email and password.</p>
          <form onSubmit={signIn}>
            <label htmlFor="admin-email">Admin email</label>
            <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="name@example.com" />
            <label htmlFor="admin-password">Admin password</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Enter your password" />
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-dashboard">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">ROOTS · Private dashboard</p>
            <h1>Guest reservations</h1>
          </div>
          <button type="button" className="admin-signout" onClick={signOut}>Sign out</button>
        </header>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {loading ? (
          <p className="admin-muted" role="status">Loading reservations…</p>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Contact</th>
                  <th>Selected bank</th>
                  <th>Receipt</th>
                  <th>Payment status</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.email}>
                    <td>{submission.name}</td>
                    <td><a href={`mailto:${submission.email}`}>{submission.email}</a><a href={`tel:${submission.phone}`}>{submission.phone}</a></td>
                    <td>{submission.selectedBank || 'Not selected'}</td>
                    <td>
                      {submission.hasReceipt ? (
                        <a href={`/api/admin/guests/${encodeURIComponent(submission.email)}/receipt`} target="_blank" rel="noreferrer">{submission.receiptName || 'View receipt'}</a>
                      ) : 'Not uploaded'}
                    </td>
                    <td><span className={submission.paymentStatus === 'Verified' ? 'status-pill is-verified' : 'status-pill'}>{submission.paymentStatus}</span></td>
                    <td>
                      {submission.paymentStatus === 'Pending' && submission.hasReceipt ? (
                        <button className="verify-button" type="button" disabled={workingEmail === submission.email} onClick={() => verifyPayment(submission.email)}>
                          {workingEmail === submission.email ? 'Verifying…' : 'Verify payment'}
                        </button>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && <tr><td className="admin-empty" colSpan={6}>No guest reservations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
