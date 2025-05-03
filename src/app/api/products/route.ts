// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { useMock } from '@/lib/env'; // Import the useMock variable
import type { Product } from '@prisma/client'; // Import Prisma type

// Define mock data using picsum.photos
const mockProducts: Product[] = [
  {
    id: 1, // Use number for ID to match Prisma
    title: 'Sample Comic #1 (Mock)',
    description: 'This is a demo comic from mock data.',
    price: 19.99,
    imageUrl: 'https://picsum.photos/seed/mock1/400/600', // Use picsum.photos
    type: 'sample',
    createdAt: new Date(), // Add required fields
    updatedAt: new Date(),
  },
  {
    id: 2, // Use number for ID
    title: 'Sample Comic #2 (Mock)',
    description: 'Another comic preview from mock data.',
    price: 24.99,
    imageUrl: 'https://picsum.photos/seed/mock2/400/600', // Use picsum.photos
    type: 'sample',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
   {
    id: 3, // Use number for ID
    title: 'Sample Comic #3 (Mock)',
    description: 'Yet another comic from mock data.',
    price: 9.99,
    imageUrl: 'https://picsum.photos/seed/mock3/400/600', // Use picsum.photos
    type: 'sample',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
   {
    id: 4, // Use number for ID
    title: 'Sample Comic #4 (Mock)',
    description: 'The final mock sample comic.',
    price: 14.50,
    imageUrl: 'https://picsum.photos/seed/mock4/400/600', // Use picsum.photos
    type: 'sample',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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
