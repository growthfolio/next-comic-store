// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import the Prisma client instance
import type { LoginCredentials } from '@/services/auth-service'; // Reuse type
import type { User as ApiUser } from '@/services/auth-service'; // Use the frontend User type definition
import { useMock } from '@/lib/env'; // Import useMock flag
import { findMockUserByEmail, mockUsers } from '@/lib/mockUsers'; // Import mock users

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as LoginCredentials;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    let user: ApiUser | null = null;
    let isPasswordValid = false;

    if (useMock) {
      // --- Mock Logic ---
      console.log("API Login: Using mock data");
      const mockUser = findMockUserByEmail(email);
      if (mockUser && mockUser.password === password) {
        user = mockUser;
        isPasswordValid = true;
        console.log(`API Login Success (Mock): User ${email} logged in`);
      } else {
        console.log(`API Login Failed (Mock): Invalid credentials for ${email}`);
        return NextResponse.json({ message: 'Invalid email or password (Mock)' }, { status: 401 });
      }
      // --- End Mock Logic ---
    } else {
      // --- Prisma Logic ---
      console.log("API Login: Using Prisma database");
      const dbUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!dbUser) {
        console.log(`API Login Failed (DB): User ${email} not found`);
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
      }

      // Compare plaintext password (INSECURE - for dev only!)
      isPasswordValid = (password === dbUser.password);

      if (!isPasswordValid) {
        console.log(`API Login Failed (DB): Invalid password for ${email}`);
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
      }

       // Map Prisma user to the ApiUser type
       user = {
         id: dbUser.id,
         name: dbUser.name,
         email: dbUser.email,
         isAdmin: dbUser.isAdmin,
       };
      console.log(`API Login Success (DB): User ${email} logged in`);
      // --- End Prisma Logic ---
    }

    // This part runs for both mock and Prisma if login is successful
    if (user && isPasswordValid) {
      // Generate a mock token
      const mockToken = `mock-${useMock ? 'mock' : 'prisma'}-jwt-token-for-${user.id}-${Date.now()}`;

      // Return token and user info
      return NextResponse.json({
          token: mockToken,
          user: user // Send filtered user details back
      });
    }

    // Should not be reached if logic is correct, but acts as a fallback
    return NextResponse.json({ message: 'Login failed due to an unexpected error' }, { status: 500 });

  } catch (error) {
    console.error('API Login Error:', error);
    // Avoid leaking detailed error messages in production
    const errorMessage = error instanceof Error ? error.message : 'Internal server error during login';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
     // Ensure Prisma client is disconnected after the request in serverless environments (only if not using mock)
     // if (!useMock) { await prisma.$disconnect(); } // Consider if needed based on deployment strategy
  }
}
