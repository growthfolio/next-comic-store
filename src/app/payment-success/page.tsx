// src/app/payment-success/page.tsx
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id'); // For potential Stripe confirmation (though webhook is better)
  const isMock = searchParams.get('mock') === 'true';
  const [isLoading, setIsLoading] = useState(!isMock); // Only load if not mock (mock confirms instantly)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      // If it's not a mock payment and we have a session ID,
      // we might try to confirm payment here (though webhooks are preferred).
      // For simplicity, we'll assume confirmation happens via webhook or mock API call.
      // If it *is* a mock payment, the create-session API already marked it paid.
      if (!isMock && sessionId) {
          // Optional: Add a client-side check or confirmation if needed,
          // but rely primarily on webhooks for real payments.
          // For now, just stop loading.
           setIsLoading(false);
      } else if (isMock) {
           setIsLoading(false); // Mock payment is confirmed by the API route directly
      } else if (!orderId) {
          setError("Order ID is missing from the URL.");
          setIsLoading(false);
      } else {
           // If it's not mock and no session_id, something might be wrong
           // For now, assume success if orderId exists, but log a warning.
           console.warn("Reached success page without session_id (non-mock). Relying on webhook confirmation.");
           setIsLoading(false);
      }

  }, [orderId, sessionId, isMock, router]);

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader className="items-center">
          {isLoading ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          ) : error ? (
              <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          ) : (
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          )}
          <CardTitle className="text-2xl font-bold">
            {isLoading ? 'Processing Payment...' : error ? 'Payment Issue' : 'Payment Successful!'}
          </CardTitle>
          <CardDescription>
            {isLoading ? 'Please wait while we confirm your payment...' : error ? 'There was an issue with your payment.' : 'Your order has been successfully placed.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive mb-6">{error}</p>
          ) : !isLoading && (
             <p className="text-muted-foreground mb-6">
               {orderId ? `Your order #${orderId} has been confirmed.` : 'Your order has been confirmed.'}
               {isMock && " (Mock Payment)"}
             </p>
          )}

          {!isLoading && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/gallery" passHref legacyBehavior>
                <Button variant="outline">Continue Shopping</Button>
              </Link>
              {user && orderId && (
                <Link href="/profile/orders" passHref legacyBehavior>
                  <Button className="bg-accent hover:bg-accent/90">
                    <Package className="mr-2 h-4 w-4" />
                    View My Orders
                  </Button>
                </Link>
              )}
              {!user && (
                <Link href="/" passHref legacyBehavior>
                    <Button>Back to Home</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
