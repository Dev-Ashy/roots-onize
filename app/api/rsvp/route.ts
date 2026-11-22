import { NextResponse } from 'next/server';
import { listRsvpSubmissions, upsertRsvpSubmission, RsvpSubmission } from './store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    if (!name || !email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid name or email address.' },
        { status: 400 }
      );
    }

    const existing = listRsvpSubmissions().find(
      (submission) => submission.email.toLowerCase() === String(email).toLowerCase()
    );
    const submission: RsvpSubmission = {
      name,
      email,
      phone,
      hasPaid: existing?.hasPaid ?? false,
      receiptUploaded: existing?.receiptUploaded ?? false,
      receiptName: existing?.receiptName,
      receiptType: existing?.receiptType,
    };
    upsertRsvpSubmission(submission);

    return NextResponse.json({
      success: true,
      message: 'Registration received. Please complete payment below.',
    });
  } catch (error) {
    console.error('RSVP error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Return all submissions for admin view
  return NextResponse.json({ submissions: listRsvpSubmissions() });
}