// src/app/api/auth/user.ts

// Basic User interface (matching context expectations)
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Store a mock hash instead of plain text
  isAdmin: boolean;
}

// In-memory user store
// IMPORTANT: In a real app, NEVER store passwords like this. Use a database and proper hashing.
// We'll use simple "password" as the password for mocks. A real hash would be much longer.
const users: ApiUser[] = [
    {
        id: 'user-1',
        name: 'Admin User',
        email: 'admin@comichub.com',
        passwordHash: 'password', // Mock "hash"
        isAdmin: true,
    },
    {
        id: 'user-2',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'password', // Mock "hash"
        isAdmin: false,
    }
];

// Mock hashing function (replace with bcrypt in real app)
const mockHashPassword = async (password: string): Promise<string> => {
    // Simulate hashing delay
    await new Promise(resolve => setTimeout(resolve, 50));
    // In real app: return bcrypt.hash(password, 10);
    return password; // For mock, just return the password (VERY INSECURE)
};

// Mock compare function (replace with bcrypt in real app)
const mockComparePassword = async (password: string, hash: string): Promise<boolean> => {
     // Simulate compare delay
    await new Promise(resolve => setTimeout(resolve, 50));
    // In real app: return bcrypt.compare(password, hash);
    return password === hash; // Simple comparison for mock
}

export const authStore = {
  findUserByEmail: (email: string): ApiUser | undefined => {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  addUser: async (name: string, email: string, password: string): Promise<ApiUser> => {
    if (authStore.findUserByEmail(email)) {
      throw new Error('Email already exists');
    }
    const passwordHash = await mockHashPassword(password);
    const newUser: ApiUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      passwordHash,
      isAdmin: email.toLowerCase() === 'admin@comichub.com', // Assign admin role based on email for mock
    };
    users.push(newUser);
    console.log('API: User added:', {id: newUser.id, email: newUser.email, isAdmin: newUser.isAdmin });
    return newUser;
  },
  verifyPassword: mockComparePassword,
};
