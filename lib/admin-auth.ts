import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export const ADMIN_EMAILS = [
  'sumaymuhammed@gmail.com',
  'meforbello@gmail.com',
  'onize.prinoni@gmail.com',
  'nimsleo01@gmail.com',
] as const;

const COOKIE_NAME = 'roots-admin';
const SESSION_MAX_AGE = 60 * 60 * 8;

function sessionSecret() {
  return process.env.ROOTS_ADMIN_PASSWORD;
}

function isAllowedAdmin(email: string) {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}

function signature(email: string, secret: string) {
  return createHmac('sha256', secret).update(email).digest('hex');
}

export function createAdminSession(response: NextResponse, email: string) {
  const secret = sessionSecret();
  if (!secret) throw new Error('ROOTS_ADMIN_PASSWORD is not configured.');
  const normalizedEmail = email.trim().toLowerCase();
  const value = `${normalizedEmail}.${signature(normalizedEmail, secret)}`;
  response.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/admin',
    maxAge: 0,
  });
}

export function verifyAdminCredentials(email: string, password: string) {
  const secret = sessionSecret();
  const normalizedEmail = email.trim().toLowerCase();
  if (!secret || !isAllowedAdmin(normalizedEmail)) return false;
  const expected = Buffer.from(secret);
  const provided = Buffer.from(password);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export function getAdminEmail(request: Request) {
  const secret = sessionSecret();
  if (!secret) return null;

  const cookie = request.headers.get('cookie') ?? '';
  const value = cookie.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!value) return null;

  const separator = value.lastIndexOf('.');
  if (separator <= 0) return null;
  const email = value.slice(0, separator);
  const provided = Buffer.from(value.slice(separator + 1));
  const expected = Buffer.from(signature(email, secret));
  if (!isAllowedAdmin(email) || provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }
  return email;
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: 'Admin sign-in is required.' }, { status: 401 });
}
