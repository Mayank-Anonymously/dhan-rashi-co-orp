import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Dhan Rashi Co-operative Society — ERP Software',
  description: 'Modern Cooperative Society Management Software developed for Dhan Rashi Co-operative Society by Makrosys Solutions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
