import prisma from '@/lib/prisma';
import type { User as PrismaUser } from '@prisma/client';

// User Interface (for frontend context/state) - keep this lean
export interface User {
  id: number; // Use number for Prisma ID
  name: string;
  email: string;
  isAdmin: boolean;
}

// Auth Response Interface from API (remains the same)
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Represents user credentials for login.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Asynchronously logs in a user by calling the API.
 * This function calls the `/api/auth/login` endpoint, which now uses Prisma.
 *
 * @param credentials The user's login credentials.
 * @returns A promise that resolves to authentication information upon successful login.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Calling login API (which uses Prisma)...');
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Login failed: ${response.statusText}`);
    }

    if (!data.token || !data.user) {
        throw new Error('Invalid response received from login API.');
    }

    // Ensure the user object matches the frontend User interface
    const responseUser = data.user as PrismaUser;
    const frontendUser: User = {
        id: responseUser.id,
        name: responseUser.name,
        email: responseUser.email,
        isAdmin: responseUser.isAdmin,
    };

    return { token: data.token, user: frontendUser };
}

/**
 * Represents user registration information.
 */
export interface RegisterInfo {
  name: string;
  email: string;
  password: string;
}

/**
 * Asynchronously registers a new user by calling the API.
 * This function calls the `/api/auth/register` endpoint, which now uses Prisma.
 *
 * @param registerInfo The user's registration information.
 * @returns A promise that resolves to authentication information upon successful registration.
 */
export async function register(registerInfo: RegisterInfo): Promise<AuthResponse> {
    console.log('Calling register API (which uses Prisma)...');
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerInfo),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Registration failed: ${response.statusText}`);
    }

    if (!data.token || !data.user) {
        throw new Error('Invalid response received from registration API.');
    }

     // Ensure the user object matches the frontend User interface
    const responseUser = data.user as PrismaUser;
    const frontendUser: User = {
        id: responseUser.id,
        name: responseUser.name,
        email: responseUser.email,
        isAdmin: responseUser.isAdmin,
    };


    return { token: data.token, user: frontendUser };
}

// No need for findUserByEmail or addUser directly in the service anymore,
// these are handled by the API routes using Prisma.
