import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect('/');
  }

  // Mock payment success — in a real app, you'd verify the Stripe session
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.redirect('/');
}