import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ROOTS | Chef Onize',
  description: 'Reserve your place at ROOTS by Chef Onize — a 7-course intimate dining experience in Abuja.',
  keywords: 'dining, restaurant, chef, fine dining, intimate, Roots, Nigeria, Abuja, gourmet, culinary',
  authors: [{ name: 'Chef Onize', url: 'https://rootsnigeria.com' }],
  openGraph: {
    title: 'ROOTS by Chef Onize — 7-Course Intimate Dining',
    description: 'A curated 7-course dining experience in Abuja. December 17, 2026.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth"
    >
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}