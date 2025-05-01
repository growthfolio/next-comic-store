'use client';

import type React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader className="items-center">
           <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl font-bold">Order Confirmed!</CardTitle>
          <CardDescription>Thank you for your purchase.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Your order has been successfully placed. You will receive an email confirmation shortly.
            (This is a simulation).
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/gallery" passHref legacyBehavior>
              <Button variant="outline">Continue Shopping</Button>
            </Link>
             {/* Link to Order History (Requires Auth) */}
             {/* <Link href="/profile/orders" passHref legacyBehavior>
               <Button>View Order History</Button>
             </Link> */}
             <Link href="/" passHref legacyBehavior>
                <Button>Back to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
