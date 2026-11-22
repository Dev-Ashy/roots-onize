import { NextResponse } from 'next/server';
import { clearAdminSession, createAdminSession, verifyAdminCredentials } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!process.env.ROOTS_ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Admin access is not configured.' }, { status: 503 });
    }
    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    createAdminSession(response, email);
    return response;
  } catch (error) {
    console.error('Admin sign-in error:', error);
    return NextResponse.json({ error: 'Unable to sign in.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearAdminSession(response);
  return response;
}
