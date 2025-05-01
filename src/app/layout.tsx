import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {Toaster} from '@/components/ui/toaster';
import {Providers} from '@/components/Providers'; // Import the new Providers component
import './globals.css';

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

// No QueryClient needed here anymore
// const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        {/* Wrap children with Providers */}
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
