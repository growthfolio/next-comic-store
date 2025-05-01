// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { authStore } from '../user'; // Import shared store
import type { RegisterInfo } from '@/services/auth-service'; // Reuse type

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

    // Simulate database check/insert delay
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        const newUser = await authStore.addUser(name, email, password);

        // Generate a mock token for the new user
        const mockToken = `mock-jwt-token-for-${newUser.id}-${Date.now()}`;

        console.log(`API Registration Success: User ${email} registered`);

         // Return token and user info (excluding password hash)
        const { passwordHash, ...userResponse } = newUser;
        return NextResponse.json({
            token: mockToken,
            user: userResponse
        }, { status: 201 }); // Created

    } catch (error: any) {
        if (error.message === 'Email already exists') {
             console.log(`API Registration Failed: Email ${email} already exists`);
             return NextResponse.json({ message: 'Email already registered' }, { status: 409 }); // Conflict
        }
        throw error; // Re-throw other errors
    }

  } catch (error) {
    console.error('API Registration Error:', error);
    return NextResponse.json({ message: 'Internal server error during registration' }, { status: 500 });
  }
}
