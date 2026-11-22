import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getSubmission, receiptPrefix, verifyUploadToken } from '@/lib/roots-store';

const allowedContentTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload: { email?: unknown; uploadToken?: unknown };
        try {
          payload = JSON.parse(clientPayload ?? '') as typeof payload;
        } catch {
          throw new Error('Invalid reservation details.');
        }

        const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
        const token = typeof payload.uploadToken === 'string' ? payload.uploadToken : '';
        const submission = await getSubmission(email);
        if (!submission || !submission.selectedBank || !verifyUploadToken(submission, token)) {
          throw new Error('Please complete your reservation details and select a bank first.');
        }
        if (!pathname.startsWith(receiptPrefix())) {
          throw new Error('Invalid receipt destination.');
        }

        return {
          allowedContentTypes,
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: false,
        };
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Receipt upload token error:', error);
    return NextResponse.json({ error: 'Unable to start receipt upload.' }, { status: 400 });
  }
}
