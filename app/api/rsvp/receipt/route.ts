import { NextResponse } from 'next/server';
import { markReceiptUploaded } from '../store';

type ReceiptSubmission = {
  email: string;
  receiptName: string;
  receiptType: string;
};

const receipts: ReceiptSubmission[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, receiptName, receiptType, receiptData } = body;

    if (!email || !receiptName || !receiptType || !receiptData) {
      return NextResponse.json({ error: 'Missing receipt details.' }, { status: 400 });
    }
    if (typeof receiptData !== 'string' || !receiptData.startsWith('data:')) {
      return NextResponse.json({ error: 'Invalid receipt file.' }, { status: 400 });
    }
    if (receiptData.length > 12 * 1024 * 1024) {
      return NextResponse.json({ error: 'Receipt file is too large.' }, { status: 413 });
    }

    receipts.push({ email, receiptName, receiptType });
    markReceiptUploaded(email, receiptName, receiptType);
    return NextResponse.json({
      success: true,
      message: 'Receipt uploaded successfully.',
    });
  } catch (error) {
    console.error('Receipt upload error:', error);
    return NextResponse.json({ error: 'Unable to upload receipt.' }, { status: 500 });
  }
}
