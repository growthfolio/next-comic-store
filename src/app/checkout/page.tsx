// src/app/checkout/page.tsx
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { addOrder } from '@/services/order-service'; // To create order before payment
import { Loader2, CreditCard, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function CheckoutPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { cartItems, totalPrice, cartCount, clearCart } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
      if (!isAuthLoading && !user) {
          toast({
              title: "Authentication Required",
              description: "Please log in to proceed to checkout.",
              variant: "destructive",
          });
          router.push('/login?redirect=/checkout');
      }
  }, [user, isAuthLoading, router, toast]);

  const calculateTaxes = (subtotal: number) => {
    // Example tax calculation
    return subtotal * 0.08;
  };

  const subtotal = totalPrice;
  const taxes = calculateTaxes(subtotal);
  const finalTotal = subtotal + taxes;

  const handlePlaceOrderAndPay = async () => {
    if (!user || typeof user.id !== 'number') {
        toast({ title: "Error", description: "User information is missing or invalid.", variant: "destructive" });
        return;
    }
     if (cartItems.length === 0) {
         toast({ title: "Cart Empty", description: "Cannot checkout with an empty cart.", variant: "destructive" });
         return;
     }

    setIsProcessing(true);
    let createdOrderId: number | null = null;

    try {
        // Step 1: Create the order in 'Pending' state
        console.log("Creating order in database...");
        const createdOrder = await addOrder(user.id, user.name || 'Customer', cartItems, finalTotal);
        createdOrderId = createdOrder.id;
        console.log(`Order ${createdOrderId} created with status ${createdOrder.status}`);

        // Step 2: Call the create-session API with items and the new orderId
        console.log(`Creating payment session for order ${createdOrderId}...`);
        const response = await fetch('/api/payment/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cartItems, orderId: createdOrderId }),
        });

        const sessionData = await response.json();

        if (!response.ok) {
            // If session creation fails, maybe mark order as failed or allow retry?
            await prisma.order.update({ where: { id: createdOrderId }, data: { status: 'Failed' } });
            throw new Error(sessionData.message || 'Failed to create payment session.');
        }

        if (!sessionData.checkoutUrl) {
             await prisma.order.update({ where: { id: createdOrderId }, data: { status: 'Failed' } });
             throw new Error('Checkout URL not received from API.');
        }

        // Step 3: Redirect to Stripe or Mock Success URL
        console.log(`Redirecting to: ${sessionData.checkoutUrl}`);
        clearCart(); // Clear cart after successful session creation
        router.push(sessionData.checkoutUrl);
        // No toast here, success/failure is handled on the payment-success page or by Stripe

    } catch (error) {
        console.error("Checkout process failed:", error);
        toast({
          title: 'Checkout Failed',
          description: (error as Error).message || 'There was an issue during checkout. Please try again.',
          variant: 'destructive',
        });
         // If order was created but payment session failed, update order status
         if (createdOrderId) {
             try {
                await prisma.order.update({ where: { id: createdOrderId }, data: { status: 'Failed' } });
                console.log(`Order ${createdOrderId} marked as Failed due to payment session error.`);
             } catch (updateError) {
                 console.error(`Failed to mark order ${createdOrderId} as Failed:`, updateError);
             }
         }
    } finally {
        // Only stop processing if there was an error *before* redirect
        // If redirect happens, the page unmounts anyway.
        if (router.asPath === '/checkout') { // Check if still on checkout page
           setIsProcessing(false);
        }
    }
  };

  if (isAuthLoading) {
      return (
          <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <span className="ml-4 text-muted-foreground">Verifying user...</span>
          </div>
      );
  }

  if (!user) {
       return (
           <div className="container mx-auto px-4 py-8 text-center">
               <p className="text-muted-foreground">Redirecting to login...</p>
           </div>
       );
  }


  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
          <CardDescription>Review your order and proceed to payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          {cartItems.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">Your cart is empty.</p>
              <Link href="/gallery" passHref legacyBehavior>
                <Button variant="link" className="mt-2">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.title}`} className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0">
                   {/* Image */}
                   <div className="relative w-16 h-24 flex-shrink-0">
                      {item.imageUrl ? (
                           <Image
                               src={item.imageUrl}
                               alt={item.title}
                               fill
                               style={{objectFit: 'cover'}}
                               className="rounded"
                               data-ai-hint={item.isCustom ? "user uploaded custom comic image small" : "comic book small checkout"}
                               sizes="64px"
                           />
                      ) : (
                           <div className="w-full h-full bg-muted rounded flex items-center justify-center text-muted-foreground text-xs text-center p-1">
                               {item.isCustom ? 'Custom' : 'No Img'}
                           </div>
                      )}
                    </div>

                  <div className="flex-grow min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                     {item.isCustom && item.notes && (
                         <p className="text-xs text-muted-foreground mt-1 line-clamp-1">Notes: {item.notes}</p>
                     )}
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal ({cartCount} items)</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Taxes (Est.)</p>
                  <p>${taxes.toFixed(2)}</p>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <p>Total</p>
                  <p>${finalTotal.toFixed(2)}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        {cartItems.length > 0 && (
          <CardFooter className="pt-6">
            <Button
              onClick={handlePlaceOrderAndPay}
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isProcessing || !user || cartItems.length === 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                   Proceed to Payment (${finalTotal.toFixed(2)})
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
    // Need Prisma instance here if updating order status on failure within this component
    // However, better to handle this in the API route if possible.
    return <CheckoutPageContent />;
}
