
// src/lib/mockProducts.ts
import type { Product } from '@prisma/client'; // Import Prisma type

// Define mock data using picsum.photos
export const mockProducts: Product[] = [
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
