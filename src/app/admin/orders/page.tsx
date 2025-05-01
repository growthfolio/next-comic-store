
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
        <Badge variant={variant} className="flex items-center text-xs whitespace-nowrap">
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

  // Fetch all custom orders
  const { data: orders, isLoading, error } = useQuery<UserOrder[], Error>({
    queryKey: ['allCustomOrders'],
    queryFn: getAllCustomOrders,
  });

  // Mutation for updating order status
  const mutation = useMutation({
     mutationFn: ({ orderId, newStatus }: { orderId: string, newStatus: OrderStatus }) => updateOrderStatus(orderId, newStatus),
     onMutate: async ({ orderId }) => {
       setUpdatingStatusMap(prev => ({ ...prev, [orderId]: true })); // Set loading state for this order
       // Optionally snapshot previous data and optimistic update
     },
     onSuccess: (updatedOrder, { orderId }) => {
       toast({ title: 'Status Updated', description: `Order ${orderId.substring(0, 8)}... status changed to ${updatedOrder.status}.` });
       // Invalidate and refetch the orders query to get fresh data
       queryClient.invalidateQueries({ queryKey: ['allCustomOrders'] });
     },
     onError: (err, { orderId }) => {
       toast({ title: 'Update Failed', description: (err as Error).message || 'Could not update order status.', variant: 'destructive' });
       // Optionally rollback optimistic update
     },
     onSettled: (_, __, { orderId }) => {
         setUpdatingStatusMap(prev => ({ ...prev, [orderId]: false })); // Clear loading state for this order
     },
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    mutation.mutate({ orderId, newStatus });
  };


  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel - Custom Orders</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="shadow-md">
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    toast({ title: 'Error loading orders', description: error.message, variant: 'destructive' });
    return <div className="container mx-auto px-4 py-8 text-destructive text-center">Failed to load custom orders.</div>;
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
                      <Card key={order.id} className="shadow-md overflow-hidden flex flex-col">
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
                                                  data-ai-hint="user uploaded custom comic image"
                                                   sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                              />
                                          ) : (
                                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                                  <ImageIcon className="h-8 w-8" />
                                              </div>
                                          )}
                                      </div>
                                       <div>
                                          <p className="text-sm font-medium">Notes:</p>
                                          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                                              {customItem.notes || <em>No notes provided.</em>}
                                          </p>
                                       </div>
                                  </>
                              ) : (
                                  <p className="text-sm text-muted-foreground">Error: Custom item details not found.</p>
                              )}
                          </CardContent>
                          <CardFooter className="pt-4">
                              <Select
                                  value={order.status}
                                  onValueChange={(newStatus: OrderStatus) => handleStatusChange(order.id, newStatus)}
                                  disabled={isUpdating} // Disable while updating
                              >
                                  <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Change Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {(['Pending', 'In Production', 'Completed', 'Cancelled'] as OrderStatus[]).map(statusOption => (
                                          <SelectItem key={statusOption} value={statusOption}>
                                              {isUpdating && statusOption === order.status ? (
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
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  // Layout already handles authentication and role check
  return <AdminOrdersPageContent />;
}
