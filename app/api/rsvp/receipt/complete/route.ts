import { head } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getSubmission, receiptPrefix, updateSubmission, verifyUploadToken } from '@/lib/roots-store';

const allowedContentTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const token = typeof body.uploadToken === 'string' ? body.uploadToken : '';
    const pathname = typeof body.pathname === 'string' ? body.pathname : '';
    const receiptName = typeof body.receiptName === 'string' ? body.receiptName.slice(0, 180) : '';
    const receiptType = typeof body.receiptType === 'string' ? body.receiptType : '';

    if (!email || !token || !pathname.startsWith(receiptPrefix()) || !receiptName || !allowedContentTypes.has(receiptType)) {
      return NextResponse.json({ error: 'Invalid receipt details.' }, { status: 400 });
    }

    const submission = await getSubmission(email);
    if (!submission || !submission.selectedBank || !verifyUploadToken(submission, token)) {
      return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
    }

    const blob = await head(pathname);
    if (blob.contentType !== receiptType || blob.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Receipt file could not be verified.' }, { status: 400 });
    }

    await updateSubmission(email, (current) => ({
      ...current,
      receiptName,
      receiptType,
      receiptPath: pathname,
      paymentStatus: 'Pending',
    }));

    return NextResponse.json({ success: true, paymentStatus: 'Pending' });
  } catch (error) {
    console.error('Receipt completion error:', error);
    return NextResponse.json({ error: 'Unable to verify receipt upload.' }, { status: 500 });
  }
}
