export type RsvpSubmission = {
  name: string;
  email: string;
  phone?: string;
  hasPaid: boolean;
  receiptUploaded: boolean;
  receiptName?: string;
  receiptType?: string;
};

const rsvpSubmissions: RsvpSubmission[] = [];

export function listRsvpSubmissions() {
  return rsvpSubmissions;
}

export function upsertRsvpSubmission(submission: RsvpSubmission) {
  const existingIndex = rsvpSubmissions.findIndex(
    (item) => item.email.toLowerCase() === submission.email.toLowerCase()
  );
  if (existingIndex >= 0) rsvpSubmissions[existingIndex] = submission;
  else rsvpSubmissions.push(submission);
}

export function markReceiptUploaded(email: string, receiptName: string, receiptType: string) {
  const submission = rsvpSubmissions.find(
    (item) => item.email.toLowerCase() === email.toLowerCase()
  );
  if (!submission) return false;
  submission.hasPaid = true;
  submission.receiptUploaded = true;
  submission.receiptName = receiptName;
  submission.receiptType = receiptType;
  return true;
}
