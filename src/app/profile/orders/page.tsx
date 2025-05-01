'use client';

import type React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserOrders, type UserOrder, type OrderItem, type OrderStatus } from '@/services/order-service';
import { Loader2, ShoppingBag, Package, AlertTriangle, CheckCircle, Info, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn

// Status Badge Component (Reused)
const StatusBadge = ({ status }: { status: OrderStatus }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let icon = <Info className="h-3 w-3 mr-1" />;

    switch (status) {
        case 'Pending':
            variant = "outline";
            icon = <RefreshCcw className="h-3 w-3 mr-1 animate-spin animation-duration-2000" />;
            break;
        case 'In Production':
            variant = "default";
             icon = <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
            break;
        case 'Completed':
            variant = "secondary"; // Using theme accent color (teal)
             icon = <CheckCircle className="h-3 w-3 mr-1 text-green-600" />;
            break;
         case 'Cancelled':
            variant = "destructive";
            icon = <AlertTriangle className="h-3 w-3 mr-1" />;
            break;
    }

    return (
        <Badge variant={variant} className={cn("flex items-center text-xs whitespace-nowrap capitalize")}>
            {icon}
            {status}
        </Badge>
    );
};


// Order Item Display Component (Improved)
function OrderItemDisplay({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-center gap-4 py-2 border-b last:border-b-0">
      <div className="relative w-12 h-16 flex-shrink-0 bg-muted rounded">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded"
            data-ai-hint={item.isCustom ? "user uploaded custom comic image small" : "comic book small order"}
            sizes="48px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-1 text-center">
             {item.isCustom ? 'Custom' : 'No Image'}
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-medium truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground">
          ID: <span className="font-mono text-[11px]">{typeof item.productId === 'number' ? item.productId : `${item.productId.substring(0,10)}...`}</span>
        </p>
         <p className="text-xs text-muted-foreground">Type: {item.isCustom ? 'Customized' : 'Standard'}</p>
        {item.isCustom && item.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1" title={item.notes}>Notes: {item.notes}</p>
        )}
         <p className="text-xs text-muted-foreground">Qty: {item.quantity} @ ${item.price.toFixed(2)}</p>
      </div>
       <p className="font-semibold text-sm flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
    </div>
  );
}


function OrdersPageContent() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view your orders.',
        variant: 'destructive',
      });
      router.push('/login?redirect=/profile/orders');
    }
  }, [user, isAuthLoading, router, toast]);

  // Fetch orders using useQuery, enabled only when user is loaded and exists with a numeric ID
  const isUserValid = !!user && typeof user.id === 'number';
  const { data: orders, isLoading: isOrdersLoading, error, isError } = useQuery<UserOrder[], Error>({
    queryKey: ['userOrders', user?.id], // Use numeric user ID in query key
    queryFn: () => {
      if (!user || typeof user.id !== 'number') throw new Error("User not authenticated or invalid user ID");
      return getUserOrders(user.id); // Fetch orders for the logged-in user via API using numeric ID
    },
    enabled: isUserValid && !isAuthLoading, // Only run query if user is valid and loaded
    staleTime: 1000 * 60 * 2,
  });


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

   if (isOrdersLoading && isUserValid) { // Only show loading if query is actually running
     return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">My Orders</h1>
           <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading your orders...</span>
           </div>
        </div>
     );
   }

   if (isError) {
     console.error("Error fetching user orders:", error);
     return (
        <div className="container mx-auto px-4 py-8 text-destructive text-center">
            <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-semibold mb-2">Failed to load your orders.</p>
            <p className="text-muted-foreground">({error.message})</p>
             <Button variant="link" onClick={() => router.refresh()} className="mt-4">Try Again</Button>
        </div>
     );
   }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Orders</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Orders are already sorted by API/service */}
          {orders.map((order) => (
            <Card key={order.id} className="shadow-md overflow-hidden">
              <CardHeader className="bg-muted/50 p-4 border-b">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                             <span className="truncate" title={`Order ID: ${order.id}`}>Order ID: {order.id}</span>
                             <StatusBadge status={order.status} />
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                           Placed on: {format(new Date(order.date), 'PPP p')}
                        </CardDescription>
                    </div>
                    <p className="text-lg font-semibold text-right sm:text-left mt-2 sm:mt-0">
                         Total: ${order.totalPrice.toFixed(2)}
                     </p>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                 <h4 className="text-md font-semibold mb-2">Items ({order.items.length}):</h4>
                 {order.items.map((item, index) => (
                     // Use a more robust key combining order and item identifiers
                    <OrderItemDisplay key={`${order.id}-${item.productId}-${index}`} item={item} />
                 ))}
              </CardContent>
              {/* <CardFooter className="p-4 bg-muted/50 border-t flex justify-end">
                 Optionally add actions like "Track Order" or "Reorder"
              </CardFooter> */}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg">You haven't placed any orders yet.</p>
          <Link href="/gallery" passHref legacyBehavior>
            <Button variant="link" className="mt-2">Start Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  );
}


export default function OrdersPage() {
  return <OrdersPageContent />;
}
