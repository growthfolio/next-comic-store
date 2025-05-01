
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import next/image
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart'; // Import useCart
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { addOrder } from '@/services/order-service'; // Import addOrder service
import { Loader2, CreditCard, ShoppingBag } from 'lucide-react';
import Link from 'next/link';


function CheckoutPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { cartItems, totalPrice, cartCount, clearCart } = useCart(); // Get cart data from context
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user info
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect to login if user is not authenticated and auth check is complete
  useEffect(() => {
      if (!isAuthLoading && !user) {
          toast({
              title: "Authentication Required",
              description: "Please log in to proceed to checkout.",
              variant: "destructive",
          });
          router.push('/login?redirect=/checkout'); // Redirect to login, store intended destination
      }
  }, [user, isAuthLoading, router, toast]);


  // Calculate derived values directly from context values
  const calculateTaxes = (subtotal: number) => {
    // Simulate taxes (e.g., 8%)
    return subtotal * 0.08;
  };

  const subtotal = totalPrice;
  const taxes = calculateTaxes(subtotal);
  const total = subtotal + taxes;

  const handleSimulatePayment = async () => {
    if (!user) {
        toast({ title: "Error", description: "User not found. Cannot place order.", variant: "destructive" });
        return;
    }
     if (cartItems.length === 0) {
         toast({ title: "Cart Empty", description: "Cannot checkout with an empty cart.", variant: "destructive" });
         return;
     }

    setIsProcessing(true);
    // No separate payment simulation needed, addOrder includes API call delay

    try {
        // Call the addOrder service function which interacts with the API
        await addOrder(user.email, user.name, cartItems, total); // Use user email as ID and pass name

        // If addOrder succeeds:
        toast({
          title: 'Payment Successful!',
          description: 'Your order has been placed.',
        });
        clearCart(); // Clear the cart using context function
        router.push('/order-confirmation'); // Redirect to order confirmation page

    } catch (error) {
        console.error("Failed to add order:", error);
        toast({
          title: 'Order Failed',
          description: (error as Error).message || 'There was an issue placing your order. Please try again.',
          variant: 'destructive',
        });
    } finally {
        setIsProcessing(false);
    }

  };

  // Show loading spinner if auth is loading or processing payment
  if (isAuthLoading || isProcessing) {
      return (
          <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <span className="ml-4 text-muted-foreground">{isAuthLoading ? 'Verifying user...' : 'Processing order...'}</span>
          </div>
      );
  }

  // If user check completed and still no user (should have been redirected, but as fallback)
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
          <CardDescription>Review your order and complete the payment.</CardDescription>
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
                <div key={item.id} className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0">
                   {/* Image */}
                   <div className="relative w-16 h-24 flex-shrink-0">
                      {item.imageUrl ? ( // Always show image if available
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
                  <p>${total.toFixed(2)}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
        {cartItems.length > 0 && (
          <CardFooter className="pt-6">
            <Button
              onClick={handleSimulatePayment}
              className="w-full bg-accent hover:bg-accent/90"
              disabled={isProcessing || !user || cartItems.length === 0} // Disable if processing, no user, or empty cart
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                   Place Order (${total.toFixed(2)})
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
    // Providers wrapper already handles context
    return <CheckoutPageContent />;
}
