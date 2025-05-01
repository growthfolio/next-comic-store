
'use client'; // Indicate this interacts with browser APIs (localStorage)

import type { CartItem } from '@/hooks/useCart';

// Define possible order statuses
export type OrderStatus = 'Pending' | 'In Production' | 'Completed' | 'Cancelled';

// Interface for a single item within an order
export interface OrderItem extends Omit<CartItem, 'id'> {
  productId: string; // Keep track of the original product/custom ID
}

// Interface for a complete user order
export interface UserOrder {
  id: string; // Unique order ID (e.g., timestamp or simple UUID)
  userId: string; // Associate order with a user (using email for mock)
  customerName?: string; // Store customer name for display
  date: string; // ISO date string when the order was placed
  items: OrderItem[];
  totalPrice: number; // Total price at the time of order
  status: OrderStatus; // Add status field
}

// Change storage key to represent all orders
const ORDERS_STORAGE_KEY = 'comicHubAllOrders';

// Helper function to get all orders from localStorage
const getAllOrdersFromStorage = (): UserOrder[] => {
    try {
        const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
        return storedOrders ? JSON.parse(storedOrders) : [];
    } catch (error) {
        console.error("Error reading orders from localStorage:", error);
        return [];
    }
};

// Helper function to save all orders to localStorage
const saveAllOrdersToStorage = (orders: UserOrder[]): void => {
    try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
        console.error("Error saving orders to localStorage:", error);
    }
};


/**
 * Retrieves mock orders for a specific user from the global localStorage store.
 * Simulates fetching user-specific data.
 * @param userId - The ID of the user (using email for mock).
 * @returns A promise that resolves to an array of UserOrder objects.
 */
export async function getUserOrders(userId: string): Promise<UserOrder[]> {
  console.log(`Fetching orders for user ${userId} (mock)...`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const allOrders = getAllOrdersFromStorage();
  // Filter orders belonging to the specified user
  const userOrders = allOrders.filter(order => order.userId === userId);
  return userOrders;
}

/**
 * Retrieves all custom orders from the global localStorage store.
 * @returns A promise that resolves to an array of UserOrder objects containing at least one custom item.
 */
export async function getAllCustomOrders(): Promise<UserOrder[]> {
    console.log(`Fetching all custom orders (mock)...`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const allOrders = getAllOrdersFromStorage();
    // Filter for orders that contain at least one custom item
    const customOrders = allOrders.filter(order =>
        order.items.some(item => item.isCustom)
    );
    return customOrders;
}


/**
 * Adds a new mock order to the global localStorage store.
 * @param userId - The ID of the user placing the order.
 * @param customerName - The name of the customer placing the order.
 * @param cartItems - The items in the cart at the time of checkout.
 * @param orderTotalPrice - The total price of the order.
 * @returns A promise that resolves with the newly created order.
 */
export async function addOrder(userId: string, customerName: string, cartItems: CartItem[], orderTotalPrice: number): Promise<UserOrder> {
  console.log(`Adding new order for user ${userId} (mock)...`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const newOrder: UserOrder = {
    id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: userId,
    customerName: customerName,
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
    status: 'Pending', // Default status for new orders
  };

  const allOrders = getAllOrdersFromStorage();
  allOrders.push(newOrder);
  saveAllOrdersToStorage(allOrders);
  console.log('Order added:', newOrder);
  return newOrder;
}


/**
 * Updates the status of a specific order in the global localStorage store.
 * @param orderId - The ID of the order to update.
 * @param newStatus - The new status for the order.
 * @returns A promise that resolves when the status is updated, or rejects if the order is not found.
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<UserOrder> {
    console.log(`Updating status for order ${orderId} to ${newStatus} (mock)...`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const allOrders = getAllOrdersFromStorage();
    const orderIndex = allOrders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
        throw new Error(`Order with ID ${orderId} not found.`);
    }

    allOrders[orderIndex].status = newStatus;
    saveAllOrdersToStorage(allOrders);
    console.log('Order status updated:', allOrders[orderIndex]);
    return allOrders[orderIndex];
}
