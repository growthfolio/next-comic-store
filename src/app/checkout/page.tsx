'use client';

import type React from 'react';
import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {useToast} from '@/hooks/use-toast';
import {Loader2, CreditCard} from 'lucide-react';
// Remove QueryClient imports
// import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

// Mock cart data - replace with actual cart state management later
interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string; // Optional image for display
  isCustom?: boolean; // Flag for custom items
}

const mockCart: CartItem[] = [
  { id: '1', title: 'The Amazing Spider-Man #300', price: 3.99, quantity: 1, imageUrl: `https://picsum.photos/seed/1/100/150`, isCustom: false },
  { id: 'custom-1', title: 'Custom Comic (User Upload)', price: 25.00, quantity: 1, isCustom: true },
  { id: '2', title: 'Batman: The Dark Knight Returns', price: 4.99, quantity: 2, imageUrl: `https://picsum.photos/seed/2/100/150`, isCustom: false },
];

// Remove QueryClient instantiation
// const queryClient = new QueryClient();


function CheckoutPageContent() {
  const router = useRouter();
  const {toast} = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate fetching cart data on mount
  useEffect(() => {
    // In a real app, fetch this from context, Zustand, Redux, or localStorage
    setCartItems(mockCart);
  }, []);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTaxes = (subtotal: number) => {
    // Simulate taxes (e.g., 8%)
    return subtotal * 0.08;
  };

  const calculateTotal = (subtotal: number, taxes: number) => {
    return subtotal + taxes;
  };

  const subtotal = calculateSubtotal();
  const taxes = calculateTaxes(subtotal);
  const total = calculateTotal(subtotal, taxes);

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
    // Clear cart (simulation)
    setCartItems([]);
    // Redirect to order confirmation page
    router.push('/order-confirmation'); // Example redirect
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
            <p className="text-muted-foreground text-center py-4">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0">
                   {/* Optional Image */}
                   {item.imageUrl && !item.isCustom && (
                     <img src={item.imageUrl} alt={item.title} className="w-16 h-24 object-cover rounded" data-ai-hint="comic book small"/>
                   )}
                   {item.isCustom && (
                     <div className="w-16 h-24 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs text-center">Custom Item</div>
                   )}

                  <div className="flex-grow">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal</p>
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
                  Simulate Payment
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}


// Remove the wrapper component
export default function CheckoutPage() {
    return <CheckoutPageContent />;
}
