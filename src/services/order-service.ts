
'use client'; // Indicate this interacts with browser APIs (localStorage)

import type { CartItem } from '@/hooks/useCart';

// Interface for a single item within an order
export interface OrderItem extends Omit<CartItem, 'id'> {
  productId: string; // Keep track of the original product/custom ID
}

// Interface for a complete user order
export interface UserOrder {
  id: string; // Unique order ID (e.g., timestamp or simple UUID)
  userId: string; // Associate order with a user (using email for mock)
  date: string; // ISO date string when the order was placed
  items: OrderItem[];
  totalPrice: number; // Total price at the time of order
}

const ORDERS_STORAGE_KEY = 'comicHubUserOrders';

/**
 * Retrieves mock orders for a specific user from localStorage.
 * Simulates fetching user-specific data.
 * @param userId - The ID of the user (using email for mock).
 * @returns A promise that resolves to an array of UserOrder objects.
 */
export async function getUserOrders(userId: string): Promise<UserOrder[]> {
  console.log(`Fetching orders for user ${userId} (mock)...`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const allOrders: UserOrder[] = storedOrders ? JSON.parse(storedOrders) : [];
    // Filter orders belonging to the specified user
    const userOrders = allOrders.filter(order => order.userId === userId);
    return userOrders;
  } catch (error) {
    console.error("Error reading orders from localStorage:", error);
    return []; // Return empty array on error
  }
}

/**
 * Adds a new mock order to localStorage.
 * @param userId - The ID of the user placing the order.
 * @param cartItems - The items in the cart at the time of checkout.
 * @param orderTotalPrice - The total price of the order.
 * @returns A promise that resolves when the order is added.
 */
export async function addOrder(userId: string, cartItems: CartItem[], orderTotalPrice: number): Promise<UserOrder> {
  console.log(`Adding new order for user ${userId} (mock)...`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const newOrder: UserOrder = {
    id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: userId,
    date: new Date().toISOString(),
    items: cartItems.map(item => ({
      productId: item.id, // Map CartItem.id to OrderItem.productId
      title: item.title,
      price: item.price, // Price at the time of order
      quantity: item.quantity,
      imageUrl: item.imageUrl,
      isCustom: item.isCustom,
      notes: item.notes,
    })),
    totalPrice: orderTotalPrice,
  };

  try {
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const allOrders: UserOrder[] = storedOrders ? JSON.parse(storedOrders) : [];
    allOrders.push(newOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(allOrders));
    console.log('Order added:', newOrder);
    return newOrder;
  } catch (error) {
    console.error("Error saving order to localStorage:", error);
    throw new Error("Failed to save the order."); // Re-throw for handling
  }
}
