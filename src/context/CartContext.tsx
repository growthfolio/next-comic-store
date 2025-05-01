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

 const addItem = useCallback((itemToAdd: CartItem) => {
    let itemExists = false;
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(i => i.id === itemToAdd.id);
      if (existingItemIndex > -1) {
        itemExists = true; // Mark that item existed
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + itemToAdd.quantity,
        };
        return updatedItems;
      } else {
        itemExists = false; // Mark that item is new
        return [...prevItems, itemToAdd];
      }
    });

    // Call toast *after* the state update is queued
    if (itemExists) {
        toast({ title: `${itemToAdd.title} quantity updated in cart.` });
    } else {
        toast({ title: `${itemToAdd.title} added to cart.` });
    }
  }, [toast]); // Dependency array is correct


  const removeItem = useCallback((itemId: string) => {
    let removedItemTitle: string | null = null;
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find(i => i.id === itemId);
      if (itemToRemove) {
          removedItemTitle = itemToRemove.title; // Store title for toast
      }
      return prevItems.filter(item => item.id !== itemId);
    });

    // Call toast *after* the state update is queued
    if (removedItemTitle) {
        toast({ title: `${removedItemTitle} removed from cart.`, variant: 'destructive' });
    }
  }, [toast]); // Dependency array is correct


  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems((prevItems) => {
       const itemToUpdate = prevItems.find(item => item.id === itemId);
       let updatedItems = prevItems;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        updatedItems = prevItems.filter(item => item.id !== itemId);
        if (itemToUpdate) {
             // Call toast *after* calculation, before returning state
             // This seems acceptable as it's not directly inside the state setter update function logic like before
            // toast({ title: `${itemToUpdate.title} removed from cart.`, variant: 'destructive' }); // Potentially noisy, removing for now
        }
      } else {
          updatedItems = prevItems.map(item =>
             item.id === itemId ? { ...item, quantity } : item
           );
      }
      return updatedItems; // Return the new state
    });
     // Toast for quantity update could be added here if needed, but might be too noisy.
  }, []); // Removed toast dependency as it's not called here


 const clearCart = useCallback(() => {
    setCartItems([]); // Queue state update
    // Call toast *after* state update is queued
    toast({ title: 'Cart Cleared' });
  }, [toast]); // Dependency array is correct


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
