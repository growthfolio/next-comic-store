
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
// Import API service functions
import { getAllCustomOrders, updateOrderStatus, type UserOrder, type OrderItem, type OrderStatus } from '@/services/order-service';
import { Loader2, Package, Image as ImageIcon, Info, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';

// Helper to get the first custom item's details for display
const getFirstCustomItem = (items: OrderItem[]): OrderItem | undefined => {
  return items.find(item => item.isCustom);
};

// Status Badge Component
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


// Admin Orders Page Content
function AdminOrdersPageContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingStatusMap, setUpdatingStatusMap] = useState<Record<string, boolean>>({}); // Track loading state per order

  // Fetch all custom orders using useQuery and the API service
  const { data: orders, isLoading, error, isError } = useQuery<UserOrder[], Error>({
    queryKey: ['allCustomOrders'],
    queryFn: getAllCustomOrders, // Use the API service function
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Mutation for updating order status using the API service
  const mutation = useMutation({
     mutationFn: ({ orderId, newStatus }: { orderId: string, newStatus: OrderStatus }) =>
        updateOrderStatus(orderId, newStatus), // Use the API service function
     onMutate: async ({ orderId }) => {
       setUpdatingStatusMap(prev => ({ ...prev, [orderId]: true })); // Set loading state for this order
       // Optional: Optimistic update logic could go here
       // await queryClient.cancelQueries({ queryKey: ['allCustomOrders'] })
       // const previousOrders = queryClient.getQueryData<UserOrder[]>(['allCustomOrders'])
       // queryClient.setQueryData<UserOrder[]>(['allCustomOrders'], old => ...update status locally...)
       // return { previousOrders }
     },
     onSuccess: (updatedOrder, { orderId, newStatus }) => {
       toast({ title: 'Status Updated', description: `Order ${orderId.substring(0, 8)}... status changed to ${newStatus}.` });
       // Invalidate the query to refetch fresh data after successful update
       // This replaces the optimistic update or updates on top of it
       queryClient.invalidateQueries({ queryKey: ['allCustomOrders'] });
     },
     onError: (err, { orderId }, context: any) => {
       toast({ title: 'Update Failed', description: (err as Error).message || 'Could not update order status.', variant: 'destructive' });
       // Optional: Rollback optimistic update if implemented
       // if (context?.previousOrders) {
       //   queryClient.setQueryData(['allCustomOrders'], context.previousOrders)
       // }
     },
     onSettled: (_, __, { orderId }) => {
         setUpdatingStatusMap(prev => ({ ...prev, [orderId]: false })); // Clear loading state for this order regardless of outcome
     },
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    // Prevent updating if already updating
    if (updatingStatusMap[orderId]) return;
    mutation.mutate({ orderId, newStatus });
  };


  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel - Custom Orders</h1>
         <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading custom orders...</span>
         </div>
        {/* Optional: Skeleton can be added back here */}
      </div>
    );
  }

  // Error State
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

  // Main Content
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel - Custom Orders</h1>

      {orders && orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date descending
                 .map((order) => {
                   const customItem = getFirstCustomItem(order.items); // Get details of the first custom item
                   const isUpdating = updatingStatusMap[order.id]; // Check if this specific order is being updated

                   return (
                      <Card key={order.id} className="shadow-md overflow-hidden flex flex-col bg-card">
                          <CardHeader className="pb-2">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-grow">
                                    <CardTitle className="text-lg truncate" title={`Order ID: ${order.id}`}>
                                        Order: {order.id.substring(0, 15)}...
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                        By: {order.customerName || order.userId} <br />
                                        On: {format(new Date(order.date), 'PPP p')}
                                    </CardDescription>
                                </div>
                                <StatusBadge status={order.status} />
                              </div>

                          </CardHeader>
                          <CardContent className="flex-grow space-y-3 pt-4">
                              {customItem ? (
                                  <>
                                      <div className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
                                          {customItem.imageUrl ? (
                                              <Image
                                                  src={customItem.imageUrl}
                                                  alt={`Custom image for order ${order.id}`}
                                                  fill
                                                  style={{ objectFit: 'contain' }} // Use contain to show the whole image
                                                  data-ai-hint="user uploaded custom comic image admin view"
                                                   sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                   // Add placeholder?
                                              />
                                          ) : (
                                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                                  <ImageIcon className="h-8 w-8" />
                                                  <span className="ml-2 text-sm">No Image Uploaded</span>
                                              </div>
                                          )}
                                      </div>
                                       <div>
                                          <p className="text-sm font-medium">Notes:</p>
                                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border max-h-24 overflow-y-auto">
                                              {customItem.notes || <em>No notes provided.</em>}
                                          </p>
                                       </div>
                                  </>
                              ) : (
                                  <div className="flex items-center justify-center h-full text-destructive-foreground bg-destructive/10 p-4 rounded-md">
                                      <AlertTriangle className="h-5 w-5 mr-2" />
                                      <p className="text-sm font-medium">Error: Custom item details not found.</p>
                                  </div>
                              )}
                          </CardContent>
                          <CardFooter className="pt-4 mt-auto bg-muted/30">
                              <Select
                                  value={order.status}
                                  onValueChange={(newStatus: OrderStatus) => handleStatusChange(order.id, newStatus)}
                                  disabled={isUpdating} // Disable while updating
                              >
                                  <SelectTrigger className="w-full" aria-label={`Current status ${order.status}. Change status:`}>
                                      <SelectValue placeholder="Change Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {(['Pending', 'In Production', 'Completed', 'Cancelled'] as OrderStatus[]).map(statusOption => (
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
