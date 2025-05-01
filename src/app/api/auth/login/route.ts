// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { authStore, type ApiUser } from '../user'; // Import shared store and type
import type { LoginCredentials } from '@/services/auth-service'; // Reuse type

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json() as LoginCredentials;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Simulate database lookup delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const user = authStore.findUserByEmail(email);

    if (!user) {
      console.log(`API Login Failed: User ${email} not found`);
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 }); // Unauthorized
    }

    // Simulate password check delay
    const isPasswordValid = await authStore.verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      console.log(`API Login Failed: Invalid password for ${email}`);
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 }); // Unauthorized
    }

    // Generate a mock token (in real app, use JWT library like 'jsonwebtoken' or 'jose')
    const mockToken = `mock-jwt-token-for-${user.id}-${Date.now()}`;

    console.log(`API Login Success: User ${email} logged in`);

    // Return token and user info (excluding password hash)
    const { passwordHash, ...userResponse } = user;
    return NextResponse.json({
        token: mockToken,
        user: userResponse // Send user details back too
    });

  } catch (error) {
    console.error('API Login Error:', error);
    return NextResponse.json({ message: 'Internal server error during login' }, { status: 500 });
  }
}
