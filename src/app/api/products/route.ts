// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { useMock } from '@/lib/env'; // Import the useMock variable

// Define mock data
const mockProducts = [
  {
    id: "1",
    title: 'Sample Comic #1',
    description: 'This is a demo comic.',
    price: 19.99,
    imageUrl: 'https://example.com/sample1.jpg',
    type: 'sample',
  },
  {
    id: "2",
    title: 'Sample Comic #2',
    description: 'Another comic preview.',
    price: 24.99,
    imageUrl: 'https://example.com/sample2.jpg',
    type: 'sample',
  },
] as const;

export async function GET() {
  try {
    return useMock ? NextResponse.json(mockProducts) : NextResponse.json(await prisma.product.findMany())
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
