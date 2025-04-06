import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BlindSpot',
  description: 'Stay informed with AI-powered news',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
} 