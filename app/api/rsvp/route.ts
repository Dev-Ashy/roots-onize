import { NextResponse } from 'next/server';

type RsvpSubmission = {
  name: string;
  email: string;
  phone?: string;
};

type AdminNotification = {
  name: string;
  email: string;
  phone?: string;
};

let rsvpSubmissions: RsvpSubmission[] = [];
let adminNotifications: AdminNotification[] = [];

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

    const submission: RsvpSubmission = { name, email, phone };
    rsvpSubmissions.push(submission);

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
  return NextResponse.json({ submissions: rsvpSubmissions });
}