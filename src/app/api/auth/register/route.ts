// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma client
import type { RegisterInfo } from '@/services/auth-service'; // Reuse type
import type { User as ApiUser } from '@/services/auth-service'; // Use the frontend User type definition
import { Prisma } from '@prisma/client'; // Import Prisma for error handling

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json() as RegisterInfo;

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    // Basic password length validation (example)
    if (password.length < 6) {
         return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // In a real app, hash the password here using bcrypt before saving
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: password, // Storing plaintext password (INSECURE)
        // isAdmin defaults to false in the schema
      },
    });

    // Generate a mock token for the new user
    const mockToken = `mock-prisma-jwt-token-for-${newUser.id}-${Date.now()}`;

    console.log(`API Registration Success: User ${email} registered in DB`);

     // Prepare user response object matching the frontend User type
     const userResponse: ApiUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
     };

    // Return token and user info
    return NextResponse.json({
        token: mockToken,
        user: userResponse
    }, { status: 201 }); // Created

  } catch (error) {
     console.error('API Registration Error:', error);
     // Handle specific Prisma error for unique constraint violation (email exists)
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        console.log(`API Registration Failed: Email ${ (error.meta?.target as string[] | undefined)?.includes('email') ? (await request.clone().json()).email : 'unknown'} already exists`);
        return NextResponse.json({ message: 'Email already registered' }, { status: 409 }); // Conflict
     }
     // Avoid leaking detailed error messages in production
     const errorMessage = error instanceof Error ? error.message : 'Internal server error during registration';
     return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
     // await prisma.$disconnect(); // Consider based on deployment
  }
}
