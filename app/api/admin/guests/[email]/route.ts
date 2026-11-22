import { NextResponse } from 'next/server';
import { getAdminEmail, unauthorizedAdminResponse } from '@/lib/admin-auth';
import { getSubmission, updateSubmission } from '@/lib/roots-store';

type RouteContext = { params: Promise<{ email: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!getAdminEmail(request)) return unauthorizedAdminResponse();
  const { email: encodedEmail } = await params;
  const email = decodeURIComponent(encodedEmail).trim().toLowerCase();

  try {
    const submission = await getSubmission(email);
    if (!submission) return NextResponse.json({ error: 'Guest reservation not found.' }, { status: 404 });
    if (!submission.receiptPath) {
      return NextResponse.json({ error: 'A receipt must be uploaded before payment can be verified.' }, { status: 409 });
    }

    const updated = await updateSubmission(email, (current) => ({ ...current, paymentStatus: 'Verified' }));
    return NextResponse.json({ success: true, paymentStatus: updated?.paymentStatus });
  } catch (error) {
    console.error('Admin payment verification error:', error);
    return NextResponse.json({ error: 'Unable to verify payment.' }, { status: 500 });
  }
}
