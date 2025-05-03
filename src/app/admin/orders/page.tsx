// src/app/admin/orders/page.tsx
'use client';

import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
// Import API service functions and types (now aligned with new Prisma schema)
import { getAllCustomOrders, updateOrderStatus, type UserOrder, type OrderItem, type OrderStatus } from '@/services/order-service';
import { Loader2, Package, Image as ImageIcon, Info, AlertTriangle, CheckCircle, RefreshCcw, CreditCard, XCircle } from 'lucide-react'; // Added new icons
import { cn } from '@/lib/utils'; // Import cn

// Helper to get the first custom item's details from the parsed items array
const getFirstCustomItem = (items: OrderItem[]): OrderItem | undefined => {
  return items.find(item => item.isCustom);
};

// Status Badge Component (Updated for Paid/Failed)
const StatusBadge = ({ status }: { status: OrderStatus }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    let icon = <Info className="h-3 w-3 mr-1" />;
    let textColor = ""; // To override default badge text color if needed

    switch (status) {
        case 'Pending':
            variant = "outline";
            icon = <RefreshCcw className="h-3 w-3 mr-1 animate-spin animation-duration-2000" />;
            break;
        case 'Paid': // New status
            variant = "default"; // Use primary theme color (blue)
            icon = <CreditCard className="h-3 w-3 mr-1" />;
            textColor = "text-primary-foreground"; // Ensure contrast if bg is dark
            break;
        case 'In Production':
            variant = "secondary"; // Keep secondary for in production
             icon = <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
            break;
        case 'Completed':
             variant = "default"; // Use accent theme color (teal)
             icon = <CheckCircle className="h-3 w-3 mr-1" />;
             textColor = "text-accent-foreground"; // Ensure contrast if bg is dark
             break;
         case 'Cancelled':
            variant = "destructive";
            icon = <XCircle className="h-3 w-3 mr-1" />; // Changed icon
            break;
         case 'Failed': // New status
             variant = "destructive";
             icon = <AlertTriangle className="h-3 w-3 mr-1" />;
             break;
    }

    // Special case for 'Completed' to use accent color directly for background
    const badgeClass = status === 'Completed'
        ? "bg-accent text-accent-foreground hover:bg-accent/90"
        : "";

    return (
        <Badge variant={variant} className={cn("flex items-center text-xs whitespace-nowrap capitalize", badgeClass, textColor)}>
            {icon}
            {status}
        </Badge>
    );
};


// Admin Orders Page Content
function AdminOrdersPageContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingStatusMap, setUpdatingStatusMap] = useState<Record<number, boolean>>({}); // Track loading state per order using numeric ID

  // Fetch all custom orders using useQuery and the API service
  const { data: orders, isLoading, error, isError } = useQuery<UserOrder[], Error>({
    queryKey: ['allCustomOrders'],
    queryFn: getAllCustomOrders, // API service function fetches from Prisma via API
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Mutation for updating order status using the API service
  const mutation = useMutation({
     mutationFn: ({ orderId, newStatus }: { orderId: number, newStatus: OrderStatus }) =>
        updateOrderStatus(orderId, newStatus), // Use the API service function with numeric ID
     onMutate: async ({ orderId }) => {
       setUpdatingStatusMap(prev => ({ ...prev, [orderId]: true }));
     },
     onSuccess: (updatedOrder, { orderId, newStatus }) => {
       toast({ title: 'Status Updated', description: `Order ${orderId} status changed to ${newStatus}.` });
       // Update the specific order in the cache directly for faster UI update
       queryClient.setQueryData(['allCustomOrders'], (oldData: UserOrder[] | undefined) => {
           return oldData ? oldData.map(order => order.id === orderId ? updatedOrder : order) : [];
       });
       // Optionally invalidate if other data might have changed or direct update is complex
       // queryClient.invalidateQueries({ queryKey: ['allCustomOrders'] });
     },
     onError: (err, { orderId }, context: any) => {
       toast({ title: 'Update Failed', description: (err as Error).message || 'Could not update order status.', variant: 'destructive' });
     },
     onSettled: (_, __, { orderId }) => {
         setUpdatingStatusMap(prev => ({ ...prev, [orderId]: false }));
     },
  });

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    if (updatingStatusMap[orderId]) return;
    mutation.mutate({ orderId, newStatus });
  };


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel - Custom Orders</h1>
         <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading custom orders...</span>
         </div>
      </div>
    );
  }

  if (isError) {
     console.error("Error fetching custom orders:", error);
    return (
        <div className="container mx-auto px-4 py-8 text-destructive text-center">
            <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-semibold mb-2">Failed to load custom orders.</p>
            <p className="text-muted-foreground">({error.message})</p>
            <Button variant="link" onClick={() => queryClient.invalidateQueries({ queryKey: ['allCustomOrders'] })} className="mt-4">
                Try Again
            </Button>
        </div>
     );
  }

  // Define the order of statuses for the dropdown
  const statusOptions: OrderStatus[] = ['Pending', 'Paid', 'Failed', 'In Production', 'Completed', 'Cancelled'];


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel - Custom Orders</h1>

      {orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders are potentially sorted by API/service, or sort here if needed */}
          {orders.map((order) => {
                   // Get details of the first custom item from the items array
                   const customItem = getFirstCustomItem(order.items);
                   const isUpdating = updatingStatusMap[order.id];

                   return (
                      <Card key={order.id} className="shadow-md overflow-hidden flex flex-col bg-card">
                          <CardHeader className="pb-2">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-grow">
                                    <CardTitle className="text-lg truncate" title={`Order ID: ${order.id}`}>
                                        Order ID: {order.id}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        By: {order.customerName || `User ID: ${order.userId}`} <br />
                                        On: {format(new Date(order.date), 'PPP p')}
                                    </CardDescription>
                                </div>
                                <StatusBadge status={order.status} />
                              </div>
                          </CardHeader>
                          <CardContent className="flex-grow space-y-3 pt-4">
                              {customItem ? (
                                  <>
                                      {/* Display custom item image */}
                                      <div className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
                                          {customItem.imageUrl ? (
                                              <Image
                                                  src={customItem.imageUrl}
                                                  alt={`Custom image for order ${order.id}`}
                                                  fill
                                                  style={{ objectFit: 'contain' }}
                                                  data-ai-hint="user uploaded custom comic image admin view"
                                                   sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                              />
                                          ) : (
                                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                                  <ImageIcon className="h-8 w-8" />
                                                  <span className="ml-2 text-sm">No Image Provided</span>
                                              </div>
                                          )}
                                      </div>
                                      {/* Display custom item notes */}
                                       <div>
                                          <p className="text-sm font-medium">Notes:</p>
                                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border max-h-24 overflow-y-auto">
                                              {customItem.notes || <em>No notes provided.</em>}
                                          </p>
                                       </div>
                                       {/* Display all items in the order */}
                                       {order.items.length > 0 && (
                                           <div className="mt-3 pt-3 border-t">
                                               <p className="text-xs font-medium text-muted-foreground mb-1">Order Items ({order.items.length}):</p>
                                               <ul className="text-xs list-disc list-inside text-muted-foreground space-y-1 max-h-24 overflow-y-auto">
                                                   {order.items.map((item) => (
                                                           <li key={item.id} className="truncate" title={`${item.quantity}x ${item.title} (${item.isCustom ? 'Custom' : 'Standard'}) @ $${item.price.toFixed(2)}`}>
                                                               {item.quantity}x {item.title} ({item.isCustom ? 'Custom' : 'Standard'})
                                                           </li>
                                                       ))}
                                               </ul>
                                           </div>
                                       )}
                                  </>
                              ) : (
                                  // Fallback if somehow no custom item is found in a "custom" order list (shouldn't happen with API filtering)
                                  <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/10 p-4 rounded-md">
                                      <Info className="h-5 w-5 mr-2" />
                                      <p className="text-sm font-medium">Order contains only standard items.</p>
                                  </div>
                              )}
                          </CardContent>
                          <CardFooter className="pt-4 mt-auto bg-muted/30">
                              <Select
                                  value={order.status}
                                  onValueChange={(newStatus: OrderStatus) => handleStatusChange(order.id, newStatus)}
                                  disabled={isUpdating}
                              >
                                  <SelectTrigger className="w-full" aria-label={`Current status ${order.status}. Change status:`}>
                                      <SelectValue placeholder="Change Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {statusOptions.map(statusOption => ( // Use defined status options
                                          <SelectItem key={statusOption} value={statusOption} disabled={order.status === statusOption}>
                                              {isUpdating && mutation.variables?.newStatus === statusOption ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin inline-block" />
                                              ) : null}
                                              Set as {statusOption}
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                          </CardFooter>
                      </Card>
                  );
            })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg">No custom orders found.</p>
           <p className="text-sm">When users submit custom orders, they will appear here.</p>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  // Layout already handles authentication and role check
  return <AdminOrdersPageContent />;
}
