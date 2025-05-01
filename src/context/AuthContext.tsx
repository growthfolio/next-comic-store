// src/context/AuthContext.tsx
'use client';

import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { login as apiLogin, register as apiRegister, type LoginCredentials, type RegisterInfo, type User, type AuthResponse } from '@/services/auth-service';
import { useToast } from '@/hooks/use-toast';


// User interface is imported from auth-service, which now uses number for ID

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUserInfo = localStorage.getItem(USER_INFO_KEY);

      if (storedToken && storedUserInfo) {
        setToken(storedToken);
         // Ensure stored user object matches the User interface (with number ID)
         const parsedUser = JSON.parse(storedUserInfo);
         if (typeof parsedUser.id === 'number') {
            setUser(parsedUser as User);
         } else {
             // Handle potential data corruption or old format
             console.warn("Stored user ID is not a number. Clearing auth state.");
             localStorage.removeItem(AUTH_TOKEN_KEY);
             localStorage.removeItem(USER_INFO_KEY);
         }
      }
    } catch (error) {
      console.error("Error reading auth state from localStorage:", error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const { token: authToken, user: userInfo }: AuthResponse = await apiLogin(credentials);
      setToken(authToken);
      setUser(userInfo);

      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo)); // UserInfo now has number ID
      setIsLoading(false);
      toast({ title: 'Login Successful', description: `Welcome back, ${userInfo.name}!` });
    } catch (error) {
        setIsLoading(false);
        console.error('AuthContext Login Error:', error);
        toast({ title: 'Login Failed', description: (error as Error).message || 'An unexpected error occurred.', variant: 'destructive'});
    }
  }, [router, toast]);

  const register = useCallback(async (info: RegisterInfo) => {
    try {
        setIsLoading(true);
        const { token: authToken, user: userInfo }: AuthResponse = await apiRegister(info);
        setToken(authToken);
        setUser(userInfo); // UserInfo now has number ID

        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
        setIsLoading(false);
        toast({ title: 'Registration Successful', description: `Welcome to ComicHub, ${userInfo.name}!` });
    } catch (error) {
        setIsLoading(false);
        console.error('AuthContext Registration Error:', error);
        toast({ title: 'Registration Failed', description: (error as Error).message || 'An unexpected error occurred.', variant: 'destructive'});
    }
  }, [router, toast]);


  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/');
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
