import { NextResponse } from 'next/server';
import { getPaymentDetails } from '@/lib/payment';

export async function GET() {
  const details = getPaymentDetails();
  if (!details) {
    return NextResponse.json({
      configured: false,
      error: 'Payment details are being prepared. Please contact ROOTS before making a transfer.',
    });
  }
  return NextResponse.json({ configured: true, details });
}
