// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import the Prisma client instance
import type { LoginCredentials } from '@/services/auth-service'; // Reuse type
import type { User as ApiUser } from '@/services/auth-service'; // Use the frontend User type definition

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as LoginCredentials;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Find user in the database
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      console.log(`API Login Failed: User ${email} not found in DB`);
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 }); // Unauthorized
    }

    // Compare plaintext password (INSECURE - for dev only!)
    // In a real app, use bcrypt.compare() here
    const isPasswordValid = (password === user.password);

    if (!isPasswordValid) {
      console.log(`API Login Failed: Invalid password for ${email}`);
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 }); // Unauthorized
    }

    // Generate a mock token
    const mockToken = `mock-prisma-jwt-token-for-${user.id}-${Date.now()}`;

    console.log(`API Login Success: User ${email} logged in (from DB)`);

    // Prepare user response object matching the frontend User type
    const userResponse: ApiUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    // Return token and user info
    return NextResponse.json({
        token: mockToken,
        user: userResponse // Send filtered user details back
    });

  } catch (error) {
    console.error('API Login Error:', error);
    // Avoid leaking detailed error messages in production
    const errorMessage = error instanceof Error ? error.message : 'Internal server error during login';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
     // Ensure Prisma client is disconnected after the request in serverless environments
     // await prisma.$disconnect(); // Consider if needed based on deployment strategy
  }
}
