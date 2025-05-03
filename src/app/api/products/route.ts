
// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { useMock } from '@/lib/env'; // Import the useMock variable
import type { Product } from '@prisma/client'; // Import Prisma type
import { mockProducts } from '@/lib/mockProducts'; // Import mock products from the new file

export async function GET() {
  try {
    if (useMock) {
      console.log("API GET Products: Using mock data");
      return NextResponse.json(mockProducts);
    } else {
      console.log("API GET Products: Fetching products from database");
      const products = await prisma.product.findMany();
      return NextResponse.json(products);
    }
  } catch (err) {
     console.error("API Error fetching products:", err);
     // Provide a more specific error message if possible
     const errorMessage = err instanceof Error ? err.message : 'Internal server error';
     const status = errorMessage.includes('connection error') || errorMessage.includes('libssl') ? 503 : 500; // Service Unavailable for DB errors
     const displayMessage = status === 503
        ? 'Database connection error. Please check the database server and connection settings.'
        : errorMessage;
     return NextResponse.json({ message: displayMessage }, { status: status });
  } finally {
      // In a serverless environment, it's often better to let Prisma manage connections.
      // Disconnecting after every request might be inefficient.
      // if (!useMock) { await prisma.$disconnect(); }
  }
}
