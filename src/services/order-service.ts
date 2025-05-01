
// Keep types consistent with CartContext and potential future DB schema
import type { CartItem } from '@/hooks/useCart';

// Define possible order statuses
export type OrderStatus = 'Pending' | 'In Production' | 'Completed' | 'Cancelled';

// Interface for a single item within an order
export interface OrderItem extends Omit<CartItem, 'id'> {
  productId: string; // Keep track of the original product/custom ID
}

// Interface for a complete user order (as returned by the API)
export interface UserOrder {
  id: string; // Unique order ID
  userId: string; // Associate order with a user (using email for mock)
  customerName?: string; // Store customer name for display
  date: string; // ISO date string when the order was placed
  items: OrderItem[];
  totalPrice: number; // Total price at the time of order
  status: OrderStatus; // Add status field
}

// No more localStorage interactions here. Everything goes through the API.

/**
 * Retrieves all orders from the API.
 * Note: In a real app, this might need filtering by user ID or role.
 * @returns A promise that resolves to an array of UserOrder objects.
 */
export async function getAllOrders(): Promise<UserOrder[]> {
    console.log('Fetching all orders from API...');
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            throw new Error(`Failed to fetch orders: ${response.statusText} - ${errorData.message || 'No additional error info'}`);
        }
        const data = await response.json();
        // Ensure data is an array before returning
        return Array.isArray(data) ? data as UserOrder[] : [];
    } catch (error) {
        console.error("Error in getAllOrders:", error);
        // Re-throw for react-query
        throw error;
    }
}


/**
 * Retrieves orders for a specific user by filtering the result of getAllOrders.
 * In a real API, you'd ideally have an endpoint like /api/orders?userId=...
 * @param userId - The ID of the user (using email for mock).
 * @returns A promise that resolves to an array of UserOrder objects.
 */
export async function getUserOrders(userId: string): Promise<UserOrder[]> {
  console.log(`Fetching orders for user ${userId} via API...`);
  // Simulate filtering on the client side after fetching all orders
  // In a real app, the API should support filtering by userId
  try {
    // Fetch all orders first - getAllOrders already handles fetch errors
    const allOrders = await getAllOrders();
    const userOrders = allOrders.filter(order => order.userId === userId);
    console.log(`Found ${userOrders.length} orders for user ${userId}`);
    return userOrders;
  } catch (error) {
      // Error is already logged by getAllOrders if fetch failed
      console.error(`Error filtering orders for user ${userId}.`);
      // Re-throw for react-query
      throw error;
  }
}

/**
 * Retrieves all custom orders by filtering the result of getAllOrders.
 * In a real API, you'd ideally have an endpoint like /api/orders?isCustom=true
 * @returns A promise that resolves to an array of UserOrder objects containing at least one custom item.
 */
export async function getAllCustomOrders(): Promise<UserOrder[]> {
    console.log(`Fetching all custom orders via API...`);
    // Simulate filtering on the client side
     try {
        // Fetch all orders first - getAllOrders already handles fetch errors
        const allOrders = await getAllOrders();
        const customOrders = allOrders.filter(order =>
            order.items.some(item => item.isCustom)
        );
        console.log(`Found ${customOrders.length} custom orders.`);
        return customOrders;
     } catch (error) {
         // Error is already logged by getAllOrders if fetch failed
         console.error("Error filtering custom orders.");
         // Re-throw for react-query
         throw error;
     }
}


/**
 * Adds a new order by calling the POST /api/orders endpoint.
 * @param userId - The ID of the user placing the order.
 * @param customerName - The name of the customer placing the order.
 * @param cartItems - The items in the cart at the time of checkout.
 * @param orderTotalPrice - The total price of the order.
 * @returns A promise that resolves with the newly created order.
 */
export async function addOrder(userId: string, customerName: string, cartItems: CartItem[], orderTotalPrice: number): Promise<UserOrder> {
  console.log(`Adding new order for user ${userId} via API...`);
  try {
      const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId,
              customerName,
              cartItems,
              orderTotalPrice,
          }),
      });

      const data = await response.json();

       if (!response.ok) {
            // Use message from API response if available, otherwise default
            throw new Error(data.message || `Failed to add order: ${response.statusText}`);
        }

       // Validate response structure (optional but good practice)
       if (!data.id || !data.items) {
           throw new Error('Invalid order data received from API after creation.');
       }

      console.log('Order added via API:', data);
      return data as UserOrder;
  } catch (error) {
      console.error("Error in addOrder:", error);
      throw error; // Re-throw for the calling component/hook
  }
}


/**
 * Updates the status of a specific order by calling the PATCH /api/orders/:orderId/status endpoint.
 * @param orderId - The ID of the order to update.
 * @param newStatus - The new status for the order.
 * @returns A promise that resolves with the updated order.
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<UserOrder> {
    console.log(`Updating status for order ${orderId} to ${newStatus} via API...`);
    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();

         if (!response.ok) {
            // Use message from API response if available, otherwise default
            throw new Error(data.message || `Failed to update order status: ${response.statusText}`);
        }

        // Validate response structure (optional but good practice)
        if (!data.id || data.status !== newStatus) {
           throw new Error('Invalid order data received from API after status update.');
       }


        console.log('Order status updated via API:', data);
        return data as UserOrder;
    } catch (error) {
        console.error(`Error updating status for order ${orderId}:`, error);
        throw error; // Re-throw for the calling component/hook
    }
}
