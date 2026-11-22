'use client';

import { useState, useEffect } from 'react';

type Submission = {
  name: string;
  email: string;
  phone?: string;
  hasPaid: boolean;
  receiptUploaded: boolean;
};

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rsvp')
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(
          data.submissions.map((s: any) => ({
            name: s.name,
            email: s.email,
            phone: s.phone,
            hasPaid: false,
            receiptUploaded: false,
          }))
        );
      });
    fetch('/api/admin/notification')
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications));
    setLoading(false);
  }, []);

  const validatePassword = (pw: string) => pw === 'roots2026';

  return (
    <div>
      {!showDashboard ? (
        <div className="max-w-md mx-auto py-12">
          <h1 className="text-3xl font-bold mb-4">ROOTS Admin</h1>
          <p className="text-gray-400 mb-8">Chef Onize — Intimate dining experience</p>
          
          <div className="bg-[oklch(17%_0.02_40)] rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Admin password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[oklch(13%_0.018_40)] border border-[oklch(43%_0.025_55_/_.65)] rounded px-3 py-2 focus:outline-none focus:border-[oklch(78%_0.13_78_)]"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={() => {
                if (validatePassword(password)) {
                  setEnteredPassword(password);
                  setShowDashboard(true);
                }
              }}
              className="w-full bg-[oklch(78%_0.13_78_)] text-[oklch(18%_0.025_55_)] py-2 rounded mt-4 hover:bg-[oklch(84%_0.12_82_)] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          
          <div className="bg-[oklch(17%_0.02_40)] rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Notifications ({notifications.length})</h2>
            <ul className="space-y-2 text-sm text-gray-300">
              {notifications.map((n, i) => (
                <li key={i} className="text-gray-300">
                  {n.name} — {n.email} {n.phone ? `— ${n.phone}` : ''}
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full bg-[oklch(17%_0.02_40)] text-[oklch(94%_0.025_86)]">
              <thead>
                <tr className="border-b border-[oklch(43%_0.025_55_/_.65)]">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-center">Payment</th>
                  <th className="p-3 text-center">Receipt</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => (
                  <tr key={i} className="border-b border-[oklch(43%_0.025_55_/_.65)]">
                    <td className="p-3">{sub.name}</td>
                    <td className="p-3">{sub.email}</td>
                    <td className="p-3">{sub.phone || '—'}</td>
                    <td className="p-3 text-center">
                      {sub.hasPaid ? 'Paid' : 'Pending'}
                    </td>
                    <td className="p-3 text-center">
                      {sub.receiptUploaded ? 'Uploaded' : 'Pending'}
                    </td>
                    <td className="p-3">
                      <button
                        className="text-[oklch(78%_0.13_78_)] underline"
                        onClick={() => {
                          const updated = submissions.map((s, idx) =>
                            idx === i ? { ...s, receiptUploaded: true } : s
                          );
                          // Mark as paid and notify admin
                          fetch('/api/admin/notification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: sub.name,
                              email: sub.email,
                              phone: sub.phone,
                            }),
                          });
                          setSubmissions(updated);
                        }}
                      >
                        Mark receipt uploaded
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Secret path: <code className="font-mono">/admin</code> • Password: <code className="font-mono">roots2026</code>
          </p>
        </div>
      )}
    </div>
  );
}