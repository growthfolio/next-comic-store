// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { OrderStatus } from '@/services/order-service'; // Reuse status type
import type { CartItem } from '@/hooks/useCart'; // For POST request body type
import { Prisma } from '@prisma/client';

// GET /api/orders - Returns all orders from the database
export async function GET(request: Request) {
  // Optional: Add query param handling for filtering later (e.g., by userId or status)
  // const { searchParams } = new URL(request.url);
  // const userId = searchParams.get('userId');

  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc', // Show newest orders first
      },
      // include: { user: { select: { name: true, email: true } } } // Optionally include related user data
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('API Error fetching orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
    // await prisma.$disconnect(); // Consider based on deployment
  }
}

// POST /api/orders - Creates a new order in the database
interface PostOrderRequestBody {
    userId: number; // Expect numeric ID from frontend
    customerName: string;
    itemsJson: string; // Expect items as a JSON string
    totalPrice: number;
    // Optional fields for custom orders, might be redundant if in itemsJson
    customImageUrl?: string;
    notes?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PostOrderRequestBody;
    const { userId, customerName, itemsJson, totalPrice, customImageUrl, notes } = body;

    // Basic validation
    if (!userId || !itemsJson || totalPrice === undefined) {
        return NextResponse.json({ message: 'Missing required order data (userId, itemsJson, totalPrice)' }, { status: 400 });
    }

    // Validate if itemsJson is valid JSON
    let parsedItems;
    try {
        parsedItems = JSON.parse(itemsJson);
        if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
             return NextResponse.json({ message: 'itemsJson must be a non-empty array' }, { status: 400 });
        }
    } catch (e) {
        return NextResponse.json({ message: 'Invalid itemsJson format' }, { status: 400 });
    }

    // Create the order in the database
    const newOrder = await prisma.order.create({
      data: {
        userId: userId,
        customerName: customerName,
        itemsJson: itemsJson, // Store the JSON string
        totalPrice: totalPrice,
        customImageUrl: customImageUrl, // Store if provided
        notes: notes, // Store if provided
        status: 'Pending', // Default status from schema
        // createdAt and updatedAt are handled by Prisma
      },
    });

    console.log('API: Order added to DB:', newOrder);
    return NextResponse.json(newOrder, { status: 201 }); // Return the created order

  } catch (error) {
    console.error('API Error creating order:', error);
     // Handle potential foreign key constraint errors (e.g., user doesn't exist)
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') { // Foreign key constraint failed
             return NextResponse.json({ message: `Invalid userId: ${ (error.meta?.field_name as string | undefined)?.includes('userId') ? (await request.clone().json()).userId : 'unknown'} does not exist.` }, { status: 400 });
        }
     }
    const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
    // await prisma.$disconnect(); // Consider based on deployment
  }
}

// Remove the in-memory store and helper functions
// export const ordersApiHelpers = { ... }; // No longer needed
