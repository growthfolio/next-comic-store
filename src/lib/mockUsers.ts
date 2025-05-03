import type { User } from '@/services/auth-service'; // Reuse User type

// Define mock users
export const mockUsers: User[] = [
  {
    id: 1, // Numeric ID
    name: 'Admin Mock',
    email: 'admin.mock@comichub.com',
    password: 'password', // Plain text for mock
    isAdmin: true,
  },
  {
    id: 2, // Numeric ID
    name: 'Test Mock',
    email: 'test.mock@example.com',
    password: 'password', // Plain text for mock
    isAdmin: false,
  },
];

// Helper function to find mock user by email
export function findMockUserByEmail(email: string): User | undefined {
  return mockUsers.find(user => user.email === email);
}
