// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { productsStore } from '../route'; // Import shared store

type Params = {
  id: string;
};

export async function GET(request: Request, context: { params: Params }) {
  const { id } = context.params;

  // Simulate potential delay
  await new Promise(resolve => setTimeout(resolve, 50));

  const comic = productsStore.getById(id);

  if (!comic) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(comic);
}
