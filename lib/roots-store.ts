import { createHash, timingSafeEqual } from 'node:crypto';
import { get, list, put } from '@vercel/blob';

export type PaymentStatus = 'Pending' | 'Verified';

export type RsvpSubmission = {
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  dietaryRestrictions?: string;
  paymentStatus: PaymentStatus;
  receiptName?: string;
  receiptType?: string;
  receiptPath?: string;
  uploadTokenHash: string;
};

type LocalStore = typeof globalThis & {
  __rootsRsvpStore?: Map<string, RsvpSubmission>;
  __rootsLocalReceipts?: Map<string, { bytes: Uint8Array; contentType: string }>;
};

const localStore = globalThis as LocalStore;
const memorySubmissions = localStore.__rootsRsvpStore ??= new Map<string, RsvpSubmission>();
const memoryReceipts = localStore.__rootsLocalReceipts ??= new Map<string, { bytes: Uint8Array; contentType: string }>();

function isBlobConfigured() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

function assertStorageAvailable() {
  if (!isBlobConfigured() && process.env.NODE_ENV === 'production') {
    throw new Error('Persistent RSVP storage is not configured.');
  }
}

function guestPath(email: string) {
  const hash = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  return `roots/guests/${hash}.json`;
}

export function receiptPrefix() {
  return 'roots/receipts/';
}

export function hashUploadToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function verifyUploadToken(submission: RsvpSubmission, token: string) {
  const providedHash = Buffer.from(hashUploadToken(token));
  const expectedHash = Buffer.from(submission.uploadTokenHash);
  return providedHash.length === expectedHash.length && timingSafeEqual(providedHash, expectedHash);
}

async function readBlobSubmission(pathname: string): Promise<RsvpSubmission | null> {
  const blob = await get(pathname, { access: 'private' });
  if (!blob || blob.statusCode !== 200) return null;
  return await new Response(blob.stream).json() as RsvpSubmission;
}

export async function getSubmission(email: string): Promise<RsvpSubmission | null> {
  assertStorageAvailable();
  if (!isBlobConfigured()) return memorySubmissions.get(email.trim().toLowerCase()) ?? null;
  return readBlobSubmission(guestPath(email));
}

export async function saveSubmission(submission: RsvpSubmission) {
  assertStorageAvailable();
  const key = submission.email.trim().toLowerCase();
  if (!isBlobConfigured()) {
    memorySubmissions.set(key, submission);
    return;
  }
  await put(guestPath(submission.email), JSON.stringify(submission), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function listSubmissions(): Promise<RsvpSubmission[]> {
  assertStorageAvailable();
  if (!isBlobConfigured()) return [...memorySubmissions.values()];

  const submissions: RsvpSubmission[] = [];
  let cursor: string | undefined;
  do {
    const result = await list({ prefix: 'roots/guests/', limit: 1000, cursor });
    for (const blob of result.blobs) {
      const submission = await readBlobSubmission(blob.pathname);
      if (submission) submissions.push(submission);
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  return submissions.sort((left, right) => left.name.localeCompare(right.name));
}

export async function updateSubmission(
  email: string,
  update: (submission: RsvpSubmission) => RsvpSubmission,
) {
  const submission = await getSubmission(email);
  if (!submission) return null;
  const updated = update(submission);
  await saveSubmission(updated);
  return updated;
}

export function saveLocalReceipt(pathname: string, bytes: Uint8Array, contentType: string) {
  if (process.env.NODE_ENV === 'production' || isBlobConfigured()) {
    throw new Error('Local receipt storage is only available in development.');
  }
  memoryReceipts.set(pathname, { bytes, contentType });
}

export async function readPrivateReceipt(pathname: string) {
  assertStorageAvailable();
  if (!isBlobConfigured()) {
    const receipt = memoryReceipts.get(pathname);
    if (!receipt) return null;
    const bytes = new ArrayBuffer(receipt.bytes.byteLength);
    new Uint8Array(bytes).set(receipt.bytes);
    return {
      statusCode: 200 as const,
      stream: new Blob([bytes], { type: receipt.contentType }).stream(),
    };
  }
  return get(pathname, { access: 'private' });
}
