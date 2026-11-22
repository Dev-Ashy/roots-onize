import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSubmission, hashUploadToken, saveSubmission } from '@/lib/roots-store';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const rawInstagram = typeof body.instagram === 'string' ? body.instagram.trim().replace(/^@/, '') : '';
    const instagram = `@${rawInstagram}`;
    const dietaryRestrictions = typeof body.dietaryRestrictions === 'string' ? body.dietaryRestrictions.trim() : '';

    if (
      !name ||
      name.length > 120 ||
      !EMAIL_PATTERN.test(email) ||
      phone.replace(/\D/g, '').length < 7 ||
      phone.length > 30 ||
      !/^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._]{0,28}[A-Za-z0-9])?$/.test(rawInstagram) ||
      dietaryRestrictions.length > 500
    ) {
      return NextResponse.json({ error: 'Please check your name, email, phone number, Instagram, and dietary notes.' }, { status: 400 });
    }

    const existing = await getSubmission(email);
    const uploadToken = randomBytes(32).toString('hex');
    await saveSubmission({
      name,
      email,
      phone,
      instagram,
      dietaryRestrictions,
      paymentStatus: existing?.paymentStatus ?? 'Pending',
      receiptName: existing?.receiptName,
      receiptType: existing?.receiptType,
      receiptPath: existing?.receiptPath,
      uploadTokenHash: hashUploadToken(uploadToken),
    });

    return NextResponse.json({ success: true, uploadToken });
  } catch (error) {
    console.error('RSVP error:', error);
    return NextResponse.json({ error: 'Unable to save your details. Please try again.' }, { status: 500 });
  }
}
