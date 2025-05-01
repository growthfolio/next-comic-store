// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import type { UserOrder, OrderStatus, OrderItem } from '@/services/order-service'; // Reuse types
import type { CartItem } from '@/hooks/useCart';

// In-memory store for orders
let ordersStore: UserOrder[] = [];

// Helper to get orders (simulates DB read)
const getOrders = () => ordersStore;

// Helper to add an order (simulates DB write)
const addOrderToStore = (order: UserOrder) => {
  ordersStore.push(order);
};

// Helper to update order status (simulates DB update)
const updateOrderStatusInStore = (orderId: string, status: OrderStatus): UserOrder | null => {
    const orderIndex = ordersStore.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        ordersStore[orderIndex].status = status;
        return ordersStore[orderIndex];
    }
    return null;
}

// GET /api/orders - Returns all orders
export async function GET() {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 150));
  const orders = getOrders();
  return NextResponse.json(orders);
}

// POST /api/orders - Creates a new order
interface PostOrderRequestBody {
    userId: string;
    customerName: string;
    cartItems: CartItem[];
    orderTotalPrice: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PostOrderRequestBody;
    const { userId, customerName, cartItems, orderTotalPrice } = body;

    if (!userId || !cartItems || cartItems.length === 0 || orderTotalPrice === undefined) {
        return NextResponse.json({ message: 'Missing required order data' }, { status: 400 });
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const newOrder: UserOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: userId,
      customerName: customerName,
      date: new Date().toISOString(),
      items: cartItems.map((item): OrderItem => ({ // Explicitly type the mapped item
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        isCustom: item.isCustom,
        notes: item.notes,
      })),
      totalPrice: orderTotalPrice,
      status: 'Pending', // Default status
    };

    addOrderToStore(newOrder);
    console.log('API: Order added:', newOrder);

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error('API Error creating order:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}

// We might need a PATCH or PUT later for status updates, handled here for simplicity for now
// Example: Expose update function for potential future PATCH route
export const ordersApiHelpers = {
    updateStatus: updateOrderStatusInStore,
    getOrders,
    // Note: Direct manipulation of 'ordersStore' is discouraged outside this module.
};
