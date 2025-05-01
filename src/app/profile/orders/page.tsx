
'use client';

import type React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns'; // For date formatting

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserOrders, type UserOrder, type OrderItem, type OrderStatus } from '@/services/order-service'; // Import getUserOrders
import { Loader2, ShoppingBag, Package, AlertTriangle, CheckCircle, Info, RefreshCcw } from 'lucide-react'; // Added icons for status

// Status Badge Component (similar to admin panel, reuse or abstract later)
const StatusBadge = ({ status }: { status: OrderStatus }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let icon = <Info className="h-3 w-3 mr-1" />;

    switch (status) {
        case 'Pending':
            variant = "outline";
            icon = <RefreshCcw className="h-3 w-3 mr-1 animate-spin animation-duration-2000" />;
            break;
        case 'In Production':
            variant = "default"; // Using primary color
             icon = <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
            break;
        case 'Completed':
            variant = "secondary"; // Using accent color via theme
             icon = <CheckCircle className="h-3 w-3 mr-1 text-green-600" />; // Specific color for check
            break;
         case 'Cancelled':
            variant = "destructive";
            icon = <AlertTriangle className="h-3 w-3 mr-1" />;
            break;
    }

    return (
        <Badge variant={variant} className="flex items-center text-xs whitespace-nowrap capitalize">
            {icon}
            {status}
        </Badge>
    );
};


function OrderItemDisplay({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-center gap-4 py-2 border-b last:border-b-0">
      <div className="relative w-12 h-16 flex-shrink-0">
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
          <div className="w-full h-full bg-muted rounded flex items-center justify-center text-muted-foreground text-xs p-1">
             {item.isCustom ? 'Custom' : 'No Img'}
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-medium truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground">Type: {item.isCustom ? 'Customized' : 'Standard'}</p>
        {item.isCustom && item.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">Notes: {item.notes}</p>
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

   // Route Protection Effect
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view your orders.',
        variant: 'destructive',
      });
      router.push('/login?redirect=/profile/orders'); // Redirect to login, store intended destination
    }
  }, [user, isAuthLoading, router, toast]);


  // Fetch orders using useQuery, enabled only when user is loaded and exists
  const { data: orders, isLoading: isOrdersLoading, error, isError } = useQuery<UserOrder[], Error>({
    queryKey: ['userOrders', user?.email], // Include user identifier in query key
    queryFn: () => {
      if (!user) throw new Error("User not authenticated"); // Should not happen due to protection, but for type safety
      return getUserOrders(user.email); // Fetch orders for the logged-in user via API
    },
    enabled: !!user && !isAuthLoading, // Only run query if user is loaded and exists
    staleTime: 1000 * 60 * 2, // Cache user orders for 2 minutes
  });


  // Loading States
  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <span className="ml-4 text-muted-foreground">Verifying user...</span>
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

  // Order Loading State
   if (isOrdersLoading) {
     return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6 text-center">My Orders</h1>
           <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading your orders...</span>
           </div>
          {/* Optional: Skeleton can be added back here if preferred */}
        </div>
     );
   }

   // Order Error State
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

   // Main Content
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Orders</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          {orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date descending
                 .map((order) => (
            <Card key={order.id} className="shadow-md overflow-hidden">
              <CardHeader className="bg-muted/50 p-4 border-b">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                             <span>Order ID: {order.id.substring(0, 15)}...</span>
                             <StatusBadge status={order.status} />
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                           Placed on: {format(new Date(order.date), 'PPP p')} {/* Format date */}
                        </CardDescription>
                    </div>
                    <p className="text-lg font-semibold text-right sm:text-left mt-2 sm:mt-0">
                         Total: ${order.totalPrice.toFixed(2)}
                     </p>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                 <h4 className="text-md font-semibold mb-2">Items:</h4>
                 {order.items.map((item, index) => (
                    <OrderItemDisplay key={`${order.id}-${item.productId}-${index}`} item={item} />
                 ))}
              </CardContent>
              {/* Optional Footer for actions */}
              {/* <CardFooter className="p-4 bg-muted/50 border-t flex justify-end">
                <Button variant="outline" size="sm">View Details</Button>
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
  // Providers wrapper handles context and query client
  return <OrdersPageContent />;
}
