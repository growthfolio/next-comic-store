// src/app/api/orders/[orderId]/status/route.ts
import { NextResponse } from 'next/server';
import { ordersApiHelpers } from '../route'; // Import helpers from the base orders route
import type { OrderStatus } from '@/services/order-service';

type Params = {
  orderId: string;
};

interface PatchStatusRequestBody {
  status: OrderStatus;
}

export async function PATCH(request: Request, context: { params: Params }) {
  const { orderId } = context.params;

  try {
    const body = await request.json() as PatchStatusRequestBody;
    const { status } = body;

    if (!status || !['Pending', 'In Production', 'Completed', 'Cancelled'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedOrder = ordersApiHelpers.updateStatus(orderId, status);

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    console.log(`API: Updated status for order ${orderId} to ${status}`);
    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error(`API Error updating status for order ${orderId}:`, error);
    return NextResponse.json({ message: 'Failed to update order status' }, { status: 500 });
  }
}
