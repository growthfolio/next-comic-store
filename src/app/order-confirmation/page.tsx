
'use client';

import type React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package } from 'lucide-react'; // Added Package icon
import { useAuth } from '@/hooks/useAuth'; // Import useAuth to check login status

export default function OrderConfirmationPage() {
  const { user } = useAuth(); // Check if user is logged in

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
             {/* Link to Order History (Show only if logged in) */}
             {user && (
                <Link href="/profile/orders" passHref legacyBehavior>
                   <Button className="bg-accent hover:bg-accent/90">
                       <Package className="mr-2 h-4 w-4" />
                       View My Orders
                   </Button>
                </Link>
             )}
             {/* Fallback to home if not logged in */}
             {!user && (
                 <Link href="/" passHref legacyBehavior>
                     <Button>Back to Home</Button>
                 </Link>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
