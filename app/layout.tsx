import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'SOMS - Smart Office Management System',
  description: 'Enterprise-grade AI-powered Smart Office Management Platform',
};

import { CommandPalette } from '@/components/command-palette';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
