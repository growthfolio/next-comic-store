'use client';

import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart, type CartItem } from '@/hooks/useCart';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeItem, updateQuantity, totalPrice, cartCount } = useCart();

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    const quantity = Math.max(0, newQuantity); // Ensure quantity is not negative
    updateQuantity(item.id, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Shopping Cart</CardTitle>
          <CardDescription>Review the items in your cart before proceeding to checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">Your cart is empty.</p>
              <Link href="/gallery" passHref legacyBehavior>
                <Button variant="link" className="mt-2">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 last:border-b-0">
                  {/* Image */}
                  <div className="relative w-20 h-28 flex-shrink-0">
                    {item.imageUrl && !item.isCustom ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        style={{objectFit: 'cover'}}
                        className="rounded"
                        data-ai-hint="comic book small"
                         sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded flex items-center justify-center text-muted-foreground text-xs text-center p-2">
                        {item.isCustom ? 'Custom Item' : 'No Image'}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    {item.isCustom && item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Notes: {item.notes}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">Price: ${item.price.toFixed(2)}</p>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item, parseInt(e.target.value, 10) || 1)}
                      className="h-8 w-12 text-center px-1"
                       aria-label="Item quantity"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                      onClick={() => removeItem(item.id)}
                       aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                   {/* Subtotal */}
                  <p className="font-semibold w-full sm:w-auto text-right sm:text-left mt-2 sm:mt-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="flex justify-end items-center gap-4">
                <span className="text-lg font-semibold">Subtotal ({cartCount} items):</span>
                <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
              </div>
            </>
          )}
        </CardContent>
        {cartItems.length > 0 && (
          <CardFooter className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/gallery" passHref legacyBehavior>
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Link href="/checkout" passHref legacyBehavior>
              <Button className="bg-accent hover:bg-accent/90 w-full sm:w-auto">Proceed to Checkout</Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
