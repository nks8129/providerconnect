import type { Metadata } from 'next';
import { Shell } from '@/components/layout/Shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Provider Hub - Provider Interaction & Inquiry Management',
  description: 'Streamlined provider relations management for healthcare organizations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
