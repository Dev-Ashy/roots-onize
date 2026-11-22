import { NextResponse } from 'next/server';
import { NIGERIAN_BANKS } from '@/lib/payment';
import { getSubmission, updateSubmission, verifyUploadToken } from '@/lib/roots-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const bank = typeof body.bank === 'string' ? body.bank : '';
    const token = typeof body.uploadToken === 'string' ? body.uploadToken : '';

    if (!email || !token || !NIGERIAN_BANKS.includes(bank as (typeof NIGERIAN_BANKS)[number])) {
      return NextResponse.json({ error: 'Please choose a valid bank.' }, { status: 400 });
    }

    const submission = await getSubmission(email);
    if (!submission || !verifyUploadToken(submission, token)) {
      return NextResponse.json({ error: 'Reservation not found. Please enter your details again.' }, { status: 404 });
    }

    await updateSubmission(email, (current) => ({ ...current, selectedBank: bank }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment bank selection error:', error);
    return NextResponse.json({ error: 'Unable to save your bank selection.' }, { status: 500 });
  }
}
