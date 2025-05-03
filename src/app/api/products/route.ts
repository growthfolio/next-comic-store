// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma for error types

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
      let errorMessage = 'Failed to fetch products';
      let statusCode = 500;

      if (error instanceof Prisma.PrismaClientInitializationError) {
        // Provide more specific guidance for initialization errors
        errorMessage = `Database connection error: ${error.message}. Please ensure the database file exists (path in schema.prisma), migrations are applied ('prisma migrate dev'), and the server has permissions.`;
        statusCode = 503; // Service Unavailable
        console.error("Prisma Initialization Error Details:", error.message);
        // Log potential underlying cause if available (might relate to missing engine file or permissions)
        if (error.errorCode) {
            console.error(`Prisma Error Code: ${error.errorCode}`);
        }
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma request errors (e.g., schema issues)
        errorMessage = `Database query error: ${error.code}. Please check the query and schema.`;
        console.error(`Prisma Known Request Error (${error.code}):`, error.message);
      } else if (error instanceof Error) {
        errorMessage = error.message;
        // Specific checks for common binary/library issues (might occur in some environments)
        if (error.message.includes('libssl.so')) {
           errorMessage = "Internal Server Error - Missing required system library (OpenSSL).";
           console.error("Missing OpenSSL library error:", error.message);
        } else if (error.message.includes('cannot open shared object file')) {
           errorMessage = `Internal Server Error - Failed to load database engine. Ensure Prisma binaries are correctly generated ('prisma generate') and accessible. Details: ${error.message}`;
           console.error("Database engine loading error:", error.message);
        }
      }

      return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
  // Removed finally block for $disconnect, typically managed by Prisma/Next.js lifecycle
}

// Note: The productsStore mock object is no longer needed or used here.
