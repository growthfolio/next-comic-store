// src/context/AuthContext.tsx
'use client';

import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { login as apiLogin, register as apiRegister, type LoginCredentials, type RegisterInfo, type User, type AuthResponse } from '@/services/auth-service';
import { useToast } from '@/hooks/use-toast';


// No need to redefine User interface here, it's imported from auth-service

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
// No longer need ADMIN_EMAIL here, isAdmin comes from API user object

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until check is complete
  const router = useRouter();
  const { toast } = useToast();

  // Check for existing token/user info in localStorage on mount (remains the same)
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
      // Call the API service function
      const { token: authToken, user: userInfo }: AuthResponse = await apiLogin(credentials);
      setToken(authToken);
      setUser(userInfo); // User info now comes directly from the API response

      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      setIsLoading(false);
      // Success toast can be handled here or in the calling component
      toast({ title: 'Login Successful', description: `Welcome back, ${userInfo.name}!` });
    } catch (error) {
        setIsLoading(false);
        console.error('AuthContext Login Error:', error);
        toast({ title: 'Login Failed', description: (error as Error).message || 'An unexpected error occurred.', variant: 'destructive'});
        // Do not re-throw here, handle UI feedback within the context/hook consumers
    }
  }, [router, toast]); // Dependencies updated

  const register = useCallback(async (info: RegisterInfo) => {
    try {
        setIsLoading(true);
         // Call the API service function
        const { token: authToken, user: userInfo }: AuthResponse = await apiRegister(info);
        setToken(authToken);
        setUser(userInfo); // User info now comes directly from the API response

        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
        setIsLoading(false);
        // Success toast can be handled here or in the calling component
        toast({ title: 'Registration Successful', description: `Welcome to ComicHub, ${userInfo.name}!` });
    } catch (error) {
        setIsLoading(false);
        console.error('AuthContext Registration Error:', error);
        toast({ title: 'Registration Failed', description: (error as Error).message || 'An unexpected error occurred.', variant: 'destructive'});
         // Do not re-throw here
    }
  }, [router, toast]); // Dependencies updated


  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/'); // Redirect to home after logout
     // Optional: Force a reload to ensure all state is cleared if needed
     // window.location.reload();
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
