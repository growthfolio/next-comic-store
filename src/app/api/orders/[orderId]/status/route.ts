// src/app/api/orders/[orderId]/status/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma client
import type { OrderStatus } from '@/services/order-service';
import { Prisma } from '@prisma/client';

type Params = {
  orderId: string;
};

interface PatchStatusRequestBody {
  status: OrderStatus;
}

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

    // Validate status value
    if (!status || !['Pending', 'In Production', 'Completed', 'Cancelled'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
    }

    // Update the order status in the database using Prisma
    const updatedOrder = await prisma.order.update({
      where: { id: numericOrderId },
      data: { status: status },
    });

    // Note: If the order doesn't exist, prisma.update throws PrismaClientKnownRequestError P2025
    // which will be caught below.

    console.log(`API: Updated status for order ${orderId} to ${status} in DB`);
    return NextResponse.json(updatedOrder); // Return the updated order

  } catch (error) {
    console.error(`API Error updating status for order ${orderId}:`, error);

    // Handle specific Prisma error for record not found
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
     // await prisma.$disconnect(); // Consider based on deployment
  }
}
