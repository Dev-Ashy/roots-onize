'use client';

import { useEffect, useState } from 'react';

type Submission = {
  name: string;
  email: string;
  phone?: string;
  hasPaid: boolean;
  receiptUploaded: boolean;
};

const ADMIN_EMAILS = [
  'sumaymuhammed@gmail.com',
  'meforbello@gmail.com',
  'onize.prinoni@gmail.com',
  'nimsleo01@gmail.com',
];

export default function AdminDashboard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetch('/api/rsvp').then((response) => response.json())])
      .then(([data]) => setSubmissions(data.submissions ?? []))
      .finally(() => setLoading(false));
  }, []);

  const signIn = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const emailGranted = ADMIN_EMAILS.includes(normalizedEmail);
    const passwordGranted = password === 'roots2026';
    if (!emailGranted && !passwordGranted) {
      setError('This email is not on the admin list and the password is incorrect.');
      return;
    }
    setError('');
    setShowDashboard(true);
  };

  if (!showDashboard) {
    return (
      <main className="min-h-screen bg-[#fff5d5] px-5 py-16 text-[#4d694c]">
        <div className="mx-auto max-w-md">
          <img src="/roots-logo.png" alt="ROOTS by Chef Onize" className="mx-auto mb-8 w-44 mix-blend-multiply" />
          <h1 className="mb-2 text-center font-serif text-4xl">ROOTS Admin</h1>
          <p className="mb-8 text-center text-sm text-[#627061]">Chef Onize · Intimate dining experience</p>
          <div className="border border-[#4d694c]/25 bg-white p-6">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em]" htmlFor="admin-email">Admin email</label>
            <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mb-5 min-h-12 w-full border border-[#4d694c]/25 bg-[#faf7ef] px-4 outline-none focus:border-[#4d694c]" placeholder="name@example.com" />
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em]" htmlFor="admin-password">Password fallback</label>
            <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full border border-[#4d694c]/25 bg-[#faf7ef] px-4 outline-none focus:border-[#4d694c]" placeholder="Only needed outside the allowlist" />
            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            <button type="button" onClick={signIn} className="mt-6 min-h-12 w-full bg-[#4d694c] px-5 text-xs font-bold uppercase tracking-[0.12em] text-white">Open dashboard</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff5d5] px-5 py-10 text-[#4d694c] md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em]">ROOTS</p><h1 className="font-serif text-4xl">Guest reservations</h1></div>
          <img src="/roots-logo.png" alt="" className="w-32 mix-blend-multiply" />
        </div>
        {loading ? (
          <p>Loading reservations...</p>
        ) : (
          <div className="overflow-x-auto border border-[#4d694c]/25 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead><tr className="border-b border-[#4d694c]/20"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4 text-center">Payment</th><th className="p-4 text-center">Receipt</th></tr></thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr key={`${submission.email}-${index}`} className="border-b border-[#4d694c]/10">
                    <td className="p-4">{submission.name}</td><td className="p-4">{submission.email}</td><td className="p-4">{submission.phone || '—'}</td>
                    <td className="p-4 text-center">{submission.hasPaid ? 'Paid' : 'Pending'}</td>
                    <td className="p-4 text-center">{submission.receiptUploaded ? 'Uploaded' : 'Pending'}</td>
                  </tr>
                ))}
                {submissions.length === 0 && <tr><td className="p-8 text-center text-[#627061]" colSpan={5}>No reservations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
