// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { OrderStatus, UserOrder, OrderItem as ApiOrderItem } from '@/services/order-service'; // Reuse status type
import type { CartItem } from '@/hooks/useCart'; // For POST request body type
import { Prisma } from '@prisma/client';
import { useMock } from '@/lib/env'; // Import useMock flag
import { mockOrders, addMockOrder } from '@/lib/mockOrders'; // Import mock orders and add function

// Helper type for OrderItem data coming from the request (remains the same)
interface OrderItemInput {
    productId?: number; // Optional: Link to Product
    title: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    isCustom: boolean;
    notes?: string;
}

// GET /api/orders - Returns orders, optionally filtered by userId or custom status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userIdParam = searchParams.get('userId');
  const customParam = searchParams.get('custom'); // Check for ?custom=true

  const userId = userIdParam ? parseInt(userIdParam, 10) : undefined;
  const fetchOnlyCustom = customParam === 'true';

  // Validate userId if provided
  if (userIdParam && (isNaN(userId as number) || userId === undefined)) {
     return NextResponse.json({ message: 'Invalid userId parameter' }, { status: 400 });
  }

  try {
    if (useMock) {
        // --- Mock Logic ---
        console.log("API GET Orders: Using mock data");
        let filteredOrders = [...mockOrders]; // Start with all mock orders

        if (userId !== undefined) {
            filteredOrders = filteredOrders.filter(order => order.userId === userId);
        }
        if (fetchOnlyCustom) {
            // Filter mock orders that have at least one custom item
            filteredOrders = filteredOrders.filter(order => order.items.some(item => item.isCustom));
        }
        // Sort mock orders newest first
        filteredOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return NextResponse.json(filteredOrders);
        // --- End Mock Logic ---
    } else {
        // --- Prisma Logic ---
        console.log("API GET Orders: Using Prisma database");
        const whereClause: Prisma.OrderWhereInput = {};
        if (userId !== undefined) {
        whereClause.userId = userId;
        }
        if (fetchOnlyCustom) {
        // Filter orders that have at least one OrderItem where isCustom is true
        whereClause.items = {
            some: {
                isCustom: true,
            },
        };
        }

        const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
            items: true, // Include related OrderItems
            // Optionally include user details if needed, but be mindful of data exposure
            // user: { select: { id: true, name: true, email: true } }
        },
        orderBy: {
            createdAt: 'desc', // Show newest orders first
        },
        });
        return NextResponse.json(orders);
         // --- End Prisma Logic ---
    }
  } catch (error) {
    console.error('API Error fetching orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}


// POST /api/orders - Creates a new order and its associated items in the database
interface PostOrderRequestBody {
    userId: number;
    customerName: string;
    totalPrice: number;
    items: OrderItemInput[]; // Expect an array of item details
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PostOrderRequestBody;
    const { userId, customerName, totalPrice, items } = body;

    // Basic validation (remains the same)
    if (!userId || !items || items.length === 0 || totalPrice === undefined) {
        return NextResponse.json({ message: 'Missing required order data (userId, items, totalPrice)' }, { status: 400 });
    }
     for (const item of items) {
         if (!item.title || item.price === undefined || !item.quantity) {
              return NextResponse.json({ message: `Invalid item data provided: ${JSON.stringify(item)}` }, { status: 400 });
         }
     }

    if (useMock) {
        // --- Mock Logic ---
        console.log("API POST Order: Using mock data");
        // Map input items to ApiOrderItem format for the mock function
        const apiOrderItems: ApiOrderItem[] = items.map((item, index) => ({
            id: Date.now() + index, // Temporary mock ID for the item
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            isCustom: item.isCustom,
            notes: item.notes,
        }));
        const newMockOrder = addMockOrder(userId, customerName, apiOrderItems, totalPrice);
        return NextResponse.json(newMockOrder, { status: 201 });
        // --- End Mock Logic ---
    } else {
        // --- Prisma Logic ---
        console.log("API POST Order: Using Prisma database");
        // Use a Prisma transaction to ensure atomicity (all or nothing)
        const newOrderWithItems = await prisma.$transaction(async (tx) => {
            // 1. Create the Order
            const newOrder = await tx.order.create({
                data: {
                    userId: userId,
                    customerName: customerName,
                    totalPrice: totalPrice,
                    status: 'Pending', // Default status
                    // customImageUrl and notes might be redundant if stored per item
                },
            });

            // 2. Create OrderItems linked to the new Order
            const orderItemsData = items.map(item => ({
                orderId: newOrder.id,
                productId: item.productId, // Will be null if undefined
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl,
                isCustom: item.isCustom,
                notes: item.notes,
            }));

            await tx.orderItem.createMany({
                data: orderItemsData,
            });

            // 3. Fetch the created order with its items to return
            const createdOrder = await tx.order.findUnique({
                where: { id: newOrder.id },
                include: { items: true }, // Include the items we just created
            });

            if (!createdOrder) {
                // This should not happen in a successful transaction, but good to check
                throw new Error("Failed to retrieve created order after transaction.");
            }

            return createdOrder;
        });

        console.log('API: Order with items added to DB:', newOrderWithItems);
        return NextResponse.json(newOrderWithItems, { status: 201 }); // Return the created order with items
        // --- End Prisma Logic ---
    }

  } catch (error) {
    console.error('API Error creating order:', error);
     // Handle potential foreign key constraint errors (e.g., user doesn't exist)
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') { // Foreign key constraint failed
             const fieldName = error.meta?.field_name as string | undefined;
             // Clone request to read body again for error reporting
             const requestBodyForError = await request.clone().json().catch(() => ({ userId: 'unknown' }));
             const failedValue = fieldName?.includes('userId') ? requestBodyForError.userId : 'unknown';
             return NextResponse.json({ message: `Invalid reference: ${fieldName} with value ${failedValue} does not exist.` }, { status: 400 });
        }
        if (error.code === 'P2025') { // Record to update/delete not found (shouldn't happen on create, but maybe in transaction logic)
             return NextResponse.json({ message: `Required record not found during transaction.` }, { status: 404 });
        }
     }
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
