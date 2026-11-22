import { NextResponse } from 'next/server';

type AdminNotification = {
  name: string;
  email: string;
  phone?: string;
};

let adminNotifications: AdminNotification[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    adminNotifications.push({ name, email, phone });

    return NextResponse.json({
      success: true,
      message: 'Admin notified successfully.',
    });
  } catch (error) {
    console.error('Admin notification error:', error);
    return NextResponse.json(
      { error: 'Failed to notify admin.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ notifications: adminNotifications });
}