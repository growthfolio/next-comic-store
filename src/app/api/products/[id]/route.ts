
// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { useMock } from '@/lib/env'; // Import useMock flag
import { mockProducts } from '@/lib/mockProducts'; // Import mock products from the new file

type Params = {
  id: string;
};

// GET /api/products/:id - Returns a specific product by ID
export async function GET(request: Request, context: { params: Params }) {
  const { id } = context.params;
  const numericId = parseInt(id, 10);

  // Validate if the ID is a number
  if (isNaN(numericId)) {
      return NextResponse.json({ message: 'Invalid product ID format' }, { status: 400 });
  }

  try {
    let product = null;

    if (useMock) {
      // --- Mock Logic ---
      console.log(`API GET Product/${numericId}: Using mock data`);
      product = mockProducts.find(p => p.id === numericId);
      // --- End Mock Logic ---
    } else {
      // --- Prisma Logic ---
      console.log(`API GET Product/${numericId}: Fetching from database`);
      product = await prisma.product.findUnique({
        where: { id: numericId },
      });
      // --- End Prisma Logic ---
    }

    // If product not found (in either mock or DB), return 404
    if (!product) {
      return NextResponse.json({ message: `Product with ID ${numericId} not found` }, { status: 404 });
    }

    // Return the found product
    return NextResponse.json(product);

  } catch (error) {
    console.error(`API Error fetching product ${id}:`, error);
     // Avoid leaking detailed error messages in production
    const errorMessage = error instanceof Error ? error.message : `Failed to fetch product ${id}`;
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
     // if (!useMock) { await prisma.$disconnect(); } // Consider based on deployment
  }
}
