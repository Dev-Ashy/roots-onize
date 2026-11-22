import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSubmission, saveLocalReceipt, updateSubmission, verifyUploadToken } from '@/lib/roots-store';

const allowedContentTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const uploadToken = String(formData.get('uploadToken') ?? '');
    const file = formData.get('receipt');
    if (!(file instanceof File) || !allowedContentTypes.has(file.type) || file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Choose a supported receipt file smaller than 8 MB.' }, { status: 400 });
    }

    const submission = await getSubmission(email);
    if (!submission?.selectedBank || !verifyUploadToken(submission, uploadToken)) {
      return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
    }

    const pathname = `roots/receipts/${randomUUID()}-${file.name.replace(/[^\w.-]+/g, '-').slice(-120)}`;
    saveLocalReceipt(pathname, new Uint8Array(await file.arrayBuffer()), file.type);
    await updateSubmission(email, (current) => ({
      ...current,
      receiptName: file.name.slice(0, 180),
      receiptType: file.type,
      receiptPath: pathname,
      paymentStatus: 'Pending',
    }));

    return NextResponse.json({ success: true, paymentStatus: 'Pending' });
  } catch (error) {
    console.error('Local receipt upload error:', error);
    return NextResponse.json({ error: 'Unable to save the receipt.' }, { status: 500 });
  }
}
