import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Using specific font imports
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/Providers'; // Import the new Providers component
import './globals.css';

// Correctly initialize fonts with variables
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ComicHub',
  description: 'Your marketplace for custom comics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply font variables to the body */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {/* Wrap children with Providers */}
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
