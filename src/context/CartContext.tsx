'use client';

import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string | number; // Allow both Product ID (number) and custom ID (string)
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isCustom?: boolean;
  notes?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string | number) => void; // Accept string or number
  updateQuantity: (itemId: string | number, quantity: number) => void; // Accept string or number
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
      localStorage.removeItem(CART_STORAGE_KEY);
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

 const addItem = useCallback((itemToAdd: CartItem) => {
    let itemExists = false;
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(i => i.id === itemToAdd.id);
      if (existingItemIndex > -1) {
        itemExists = true;
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + itemToAdd.quantity,
        };
        return updatedItems;
      } else {
        itemExists = false;
        return [...prevItems, itemToAdd];
      }
    });

    // Call toast after the state update is queued
    if (itemExists) {
        toast({ title: `${itemToAdd.title} quantity updated in cart.` });
    } else {
        toast({ title: `${itemToAdd.title} added to cart.` });
    }
  }, [toast]);


  const removeItem = useCallback((itemId: string | number) => {
    let removedItemTitle: string | null = null;
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find(i => i.id === itemId);
      if (itemToRemove) {
          removedItemTitle = itemToRemove.title;
      }
      return prevItems.filter(item => item.id !== itemId);
    });

    if (removedItemTitle) {
        toast({ title: `${removedItemTitle} removed from cart.`, variant: 'destructive' });
    }
  }, [toast]);


  const updateQuantity = useCallback((itemId: string | number, quantity: number) => {
    setCartItems((prevItems) => {
       const itemToUpdate = prevItems.find(item => item.id === itemId);
       let updatedItems = prevItems;

      if (quantity <= 0) {
        updatedItems = prevItems.filter(item => item.id !== itemId);
      } else {
          updatedItems = prevItems.map(item =>
             item.id === itemId ? { ...item, quantity } : item
           );
      }
      return updatedItems;
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
