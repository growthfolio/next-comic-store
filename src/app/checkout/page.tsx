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
import { Loader2, CreditCard, ShoppingBag } from 'lucide-react';
import Link from 'next/link';


function CheckoutPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { cartItems, totalPrice, cartCount, clearCart } = useCart(); // Get cart data from context
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate derived values directly from context values
  const calculateTaxes = (subtotal: number) => {
    // Simulate taxes (e.g., 8%)
    return subtotal * 0.08;
  };

  const subtotal = totalPrice;
  const taxes = calculateTaxes(subtotal);
  const total = subtotal + taxes;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    // Simulate API call for payment processing
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    // Simulate success
    toast({
      title: 'Payment Successful!',
      description: 'Your order has been placed.',
    });
    setIsProcessing(false);
    clearCart(); // Clear the cart using context function
    router.push('/order-confirmation'); // Redirect to order confirmation page
  };

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
                      {item.imageUrl ? (
                           <Image
                               src={item.imageUrl}
                               alt={item.title}
                               fill
                               style={{objectFit: 'cover'}}
                               className="rounded"
                               data-ai-hint="comic book small checkout"
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
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Simulate Payment (${total.toFixed(2)})
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
    return <CheckoutPageContent />;
}
