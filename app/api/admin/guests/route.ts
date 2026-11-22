import { NextResponse } from 'next/server';
import { getAdminEmail, unauthorizedAdminResponse } from '@/lib/admin-auth';
import { listSubmissions } from '@/lib/roots-store';

export async function GET(request: Request) {
  if (!getAdminEmail(request)) return unauthorizedAdminResponse();
  try {
    const submissions = await listSubmissions();
    return NextResponse.json({
      submissions: submissions.map((submission) => ({
        name: submission.name,
        email: submission.email,
        phone: submission.phone,
        selectedBank: submission.selectedBank,
        paymentStatus: submission.paymentStatus,
        receiptName: submission.receiptName,
        hasReceipt: Boolean(submission.receiptPath),
      })),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Admin guest list error:', error);
    return NextResponse.json({ error: 'Unable to load guest reservations.' }, { status: 500 });
  }
}
