import { NextResponse } from 'next/server';

type CheckoutRequest = {
  name: string;
  email: string;
  amount: number;
};

export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json();
    const { name, email, amount } = body;

    // Mock validation
    if (!name || !email || !email.includes('@') || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment data.' },
        { status: 400 }
      );
    }

    // Simulate Stripe Checkout Session creation
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock session ID — in a real app, this would be a Stripe API call
    const mockSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      sessionId: mockSessionId,
      url: `/payment/success?session_id=${mockSessionId}`,
    });
  } catch (error) {
    console.error('Payment checkout error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}