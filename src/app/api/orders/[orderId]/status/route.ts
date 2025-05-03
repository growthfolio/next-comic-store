// src/app/api/orders/[orderId]/status/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma client
import type { OrderStatus, UserOrder } from '@/services/order-service'; // Ensure OrderStatus includes new statuses
import { Prisma } from '@prisma/client';
import { useMock } from '@/lib/env'; // Import useMock flag
import { updateMockOrderStatus, mockOrders } from '@/lib/mockOrders'; // Import mock update function

type Params = {
  orderId: string;
};

interface PatchStatusRequestBody {
  status: OrderStatus;
}

// Valid Order Statuses
const validStatuses: OrderStatus[] = ['Pending', 'Paid', 'Failed', 'In Production', 'Completed', 'Cancelled'];

// PATCH /api/orders/:orderId/status - Updates the status of a specific order
export async function PATCH(request: Request, context: { params: Params }) {
  const { orderId } = context.params;
  const numericOrderId = parseInt(orderId, 10);

  // Validate if the ID is a number
  if (isNaN(numericOrderId)) {
      return NextResponse.json({ message: 'Invalid order ID format' }, { status: 400 });
  }

  try {
    const body = await request.json() as PatchStatusRequestBody;
    const { status } = body;

    // Validate status value against the allowed list
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ message: `Invalid status provided. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    if (useMock) {
        // --- Mock Logic ---
        console.log(`API PATCH Order Status (Mock): Updating order ${numericOrderId} to ${status}`);
        const updatedMockOrder = updateMockOrderStatus(numericOrderId, status);

        if (!updatedMockOrder) {
            return NextResponse.json({ message: 'Order not found (Mock)' }, { status: 404 });
        }
        return NextResponse.json(updatedMockOrder);
        // --- End Mock Logic ---
    } else {
        // --- Prisma Logic ---
        console.log(`API PATCH Order Status (DB): Updating order ${numericOrderId} to ${status}`);
        try {
            const updatedOrder = await prisma.order.update({
                where: { id: numericOrderId },
                data: { status: status },
                include: { items: true }, // Include items in the response
            });
            console.log(`API: Updated status for order ${orderId} to ${status} in DB`);
            return NextResponse.json(updatedOrder); // Return the updated order with items
        } catch (error) {
             console.error(`API Error updating status for order ${orderId} (DB):`, error);
             // Handle specific Prisma error for record not found
             if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                 return NextResponse.json({ message: 'Order not found' }, { status: 404 });
             }
             throw error; // Re-throw other Prisma errors
        }
        // --- End Prisma Logic ---
    }

  } catch (error) {
    console.error(`API Error updating status for order ${orderId}:`, error);
    // General error handling (if not caught by Prisma specific handler)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
