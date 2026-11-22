export const NIGERIAN_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Globus Bank',
  'Guaranty Trust Bank (GTBank)',
  'Keystone Bank',
  'Kuda',
  'Moniepoint',
  'OPay',
  'Polaris Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Union Bank',
  'United Bank for Africa (UBA)',
  'Wema Bank',
  'Zenith Bank',
] as const;

export type NigerianBank = (typeof NIGERIAN_BANKS)[number];

export function getPaymentDetails() {
  const bank = process.env.ROOTS_ACCOUNT_BANK?.trim();
  const name = process.env.ROOTS_ACCOUNT_NAME?.trim();
  const number = process.env.ROOTS_ACCOUNT_NUMBER?.replace(/\s/g, '');

  if (!bank || !name || !number || !/^\d{10}$/.test(number)) return null;
  return { bank, name, number };
}
