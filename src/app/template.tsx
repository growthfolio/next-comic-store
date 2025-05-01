import type React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
// Remove QueryClient imports
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Remove queryClient instantiation
// const queryClient = new QueryClient();

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    // Remove QueryClientProvider wrapper
    // <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    // </QueryClientProvider>
  );
}
