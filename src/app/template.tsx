// Removed 'use client' - Template can be a Server Component if no client-side hooks are directly used here.
import type React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// No QueryClientProvider needed here anymore, it's in Providers.tsx

export default function Template({ children }: { children: React.ReactNode }) {
  return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
  );
}
