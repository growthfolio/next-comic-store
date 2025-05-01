'use client';

import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { login as apiLogin, register as apiRegister, type LoginCredentials, type RegisterInfo } from '@/services/auth-service';
import { useToast } from '@/hooks/use-toast';


interface User {
  name: string;
  email: string;
  isAdmin?: boolean; // Add isAdmin flag
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (info: RegisterInfo) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'comicHubAuthToken';
const USER_INFO_KEY = 'comicHubUserInfo';
const ADMIN_EMAIL = 'admin@comichub.com'; // Define an admin email for mocking

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until check is complete
  const router = useRouter();
  const { toast } = useToast();

  // Check for existing token/user info in localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUserInfo = localStorage.getItem(USER_INFO_KEY);

      if (storedToken && storedUserInfo) {
        setToken(storedToken);
        setUser(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error("Error reading auth state from localStorage:", error);
      // Clear potentially corrupted storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
    } finally {
      setIsLoading(false); // Finished checking
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const { token: authToken } = await apiLogin(credentials); // Get token from mock service
      setToken(authToken);

      // Mock user info based on email (in real app, get from API)
      const isAdmin = credentials.email.toLowerCase() === ADMIN_EMAIL;
      const userInfo: User = {
          name: credentials.email.split('@')[0] || 'User',
          email: credentials.email,
          isAdmin: isAdmin
      };
      setUser(userInfo);

      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      setIsLoading(false);
    } catch (error) {
        setIsLoading(false);
        throw error; // Re-throw for the page to handle
    }
  }, [router, toast]); // No need for toast here, handled in page

  const register = useCallback(async (info: RegisterInfo) => {
    try {
        setIsLoading(true);
         // Prevent registering the admin email
        if (info.email.toLowerCase() === ADMIN_EMAIL) {
            throw new Error(`Cannot register with the admin email address.`);
        }
        const { token: authToken } = await apiRegister(info); // Get token from mock service
        setToken(authToken);

        const userInfo: User = { name: info.name, email: info.email, isAdmin: false }; // New users are not admins
        setUser(userInfo);

        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
        setIsLoading(false);
    } catch (error) {
        setIsLoading(false);
        throw error; // Re-throw for the page to handle
    }
  }, [router, toast]); // No need for toast here, handled in page


  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/'); // Redirect to home after logout
  }, [router, toast]);

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
