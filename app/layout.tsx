import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ROOTS by Chef Onize — 7-Course Intimate Dining',
  description: 'ROOTS by Chef Onize — A curated 7-course dining experience in Abuja. December 17, 2026. 6 PM start. ₦120,000 per guest.',
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
        {/* Custom cursor for interactive elements - subtle dot */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Minimal cursor enhancement for desktop
              if (window.matchMedia('(hover: hover)').matches) {
                document.body.style.cursor = 'none';
                const cursor = document.createElement('div');
                cursor.id = 'custom-cursor';
                cursor.style.cssText = 'position:fixed;top:0;left:0;width:12px;height:12px;border-radius:50%;background:var(--gold);pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:transform .15s cubic-bezier(.2,0,.8,1),opacity .15s cubic-bezier(.2,0,.8,1);opacity:0;mix-blend-mode:screen;';
                document.body.appendChild(cursor);
                document.addEventListener('mousemove', (e) => {
                  cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
                });
                document.addEventListener('mousedown', () => cursor.style.transform += ' scale(.8)');
                document.addEventListener('mouseup', () => cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)');
              }
            `
          }}
        />
      </body>
    </html>
  );
}