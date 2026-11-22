import { NextResponse } from 'next/server';
import { getAdminEmail, unauthorizedAdminResponse } from '@/lib/admin-auth';
import { getSubmission, readPrivateReceipt } from '@/lib/roots-store';

type RouteContext = { params: Promise<{ email: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  if (!getAdminEmail(request)) return unauthorizedAdminResponse();
  const { email: encodedEmail } = await params;
  const email = decodeURIComponent(encodedEmail).trim().toLowerCase();

  try {
    const submission = await getSubmission(email);
    if (!submission?.receiptPath || !submission.receiptType) {
      return NextResponse.json({ error: 'Receipt not found.' }, { status: 404 });
    }
    const receipt = await readPrivateReceipt(submission.receiptPath);
    if (!receipt || receipt.statusCode !== 200) {
      return NextResponse.json({ error: 'Receipt not found.' }, { status: 404 });
    }

    return new Response(receipt.stream, {
      headers: {
        'Content-Type': submission.receiptType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(submission.receiptName ?? 'receipt')}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Admin receipt retrieval error:', error);
    return NextResponse.json({ error: 'Unable to load receipt.' }, { status: 500 });
  }
}
