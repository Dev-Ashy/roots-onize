export function getPaymentDetails() {
  const bank = process.env.ROOTS_ACCOUNT_BANK?.trim();
  const name = process.env.ROOTS_ACCOUNT_NAME?.trim();
  const number = process.env.ROOTS_ACCOUNT_NUMBER?.replace(/\s/g, '');

  if (!bank || !name || !number || !/^\d{10}$/.test(number)) return null;
  return { bank, name, number };
}
