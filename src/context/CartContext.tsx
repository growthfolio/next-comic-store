'use client';

import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string; // Can be comic ID or custom ID
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string; // Optional image
  isCustom?: boolean; // Flag for custom items
  notes?: string; // Notes for custom items
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'comicHubCart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Error reading cart state from localStorage:", error);
      localStorage.removeItem(CART_STORAGE_KEY); // Clear potentially corrupted storage
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart state to localStorage:", error);
    }
  }, [cartItems]);

  const addItem = useCallback((item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      if (existingItemIndex > -1) {
        // Item already exists, increase quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        };
        toast({ title: `${item.title} quantity updated in cart.` });
        return updatedItems;
      } else {
        // Add new item
        toast({ title: `${item.title} added to cart.` });
        return [...prevItems, item];
      }
    });
  }, [toast]);

  const removeItem = useCallback((itemId: string) => {
    setCartItems((prevItems) => {
        const itemToRemove = prevItems.find(i => i.id === itemId);
        if (itemToRemove) {
            toast({ title: `${itemToRemove.title} removed from cart.`, variant: 'destructive' });
        }
        return prevItems.filter(item => item.id !== itemId);
    });
  }, [toast]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return prevItems.filter(item => item.id !== itemId);
      }
      return prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({ title: 'Cart Cleared' });
  }, [toast]);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);


  const value = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;
