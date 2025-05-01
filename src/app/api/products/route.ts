// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products - Returns all products from the database
export async function GET() {
  try {
    // Fetch all products using Prisma client
    const products = await prisma.product.findMany({
       orderBy: {
            // Optional: sort by title or createdAt, etc.
            title: 'asc'
       }
    });
    return NextResponse.json(products);
  } catch (error) {
      console.error("API Error fetching products:", error);
      // Avoid leaking detailed error messages in production
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
     // await prisma.$disconnect(); // Consider based on deployment
  }
}

// Note: The productsStore mock object is no longer needed or used here.
