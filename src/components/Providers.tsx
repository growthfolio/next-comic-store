'use client';

import type React from 'react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import { CartProvider } from '@/context/CartContext'; // Import CartProvider

export function Providers({ children }: { children: React.ReactNode }) {
  // Use useState to ensure QueryClient is only created once per client session
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider> {/* Wrap with AuthProvider */}
        <CartProvider> {/* Wrap with CartProvider */}
          {children}
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
