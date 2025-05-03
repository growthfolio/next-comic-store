import type { Order as PrismaOrder, Product, OrderItem as PrismaOrderItem, User as PrismaUser } from '@prisma/client';
import type { CartItem } from '@/hooks/useCart';

// Define possible order statuses (remains the same)
export type OrderStatus = 'Pending' | 'In Production' | 'Completed' | 'Cancelled';

// Interface for a single item within an order, mapping from PrismaOrderItem
export interface OrderItem {
  id: number; // ID of the OrderItem record itself
  productId?: number | null; // ID of the related Product (if standard)
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  isCustom: boolean;
  notes?: string | null;
}

// Interface for a complete user order (as returned by the API, mapped from PrismaOrder + relations)
export interface UserOrder {
  id: number; // Use number for Prisma ID
  userId: number; // Foreign key to User
  customerName?: string | null; // Made nullable to match Prisma schema
  date: string; // ISO date string when the order was placed (from createdAt)
  items: OrderItem[]; // Now an array of OrderItem interfaces
  totalPrice: number;
  status: OrderStatus;
  // Include customImageUrl and notes if directly on the order (might be redundant now)
  customImageUrl?: string | null;
  notes?: string | null;
}

// Type combining PrismaOrder with its related OrderItems
type PrismaOrderWithItems = PrismaOrder & {
    items: PrismaOrderItem[];
};


/**
 * Helper function to map PrismaOrder with included items to the frontend UserOrder interface.
 */
function mapPrismaOrderToUserOrder(prismaOrder: PrismaOrderWithItems): UserOrder {
    const items: OrderItem[] = prismaOrder.items.map(item => ({
        id: item.id,
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        isCustom: item.isCustom,
        notes: item.notes,
    }));

    // Find the first custom item if needed (though these fields might be removed from UserOrder)
    const firstCustomItem = items.find(item => item.isCustom);

    return {
        id: prismaOrder.id,
        userId: prismaOrder.userId,
        customerName: prismaOrder.customerName,
        date: prismaOrder.createdAt.toISOString(),
        items: items,
        totalPrice: prismaOrder.totalPrice,
        status: prismaOrder.status as OrderStatus,
        // Potentially redundant fields:
        customImageUrl: prismaOrder.customImageUrl ?? firstCustomItem?.imageUrl,
        notes: prismaOrder.notes ?? firstCustomItem?.notes,
    };
}


/**
 * Retrieves all orders from the API, including their items.
 * The API route /api/orders now uses Prisma and includes items.
 * @returns A promise that resolves to an array of UserOrder objects.
 */
export async function getAllOrders(): Promise<UserOrder[]> {
    console.log('Fetching all orders with items from API (using Prisma backend)...');
    try {
        const response = await fetch('/api/orders'); // API should include items
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            throw new Error(`Failed to fetch orders: ${response.statusText} - ${errorData.message || 'No additional error info'}`);
        }
        const prismaOrdersWithItems: PrismaOrderWithItems[] = await response.json();
        // Map PrismaOrder[] to UserOrder[]
        return prismaOrdersWithItems.map(mapPrismaOrderToUserOrder);
    } catch (error) {
        console.error("Error in getAllOrders:", error);
        throw error; // Re-throw for react-query
    }
}


/**
 * Retrieves orders for a specific user by calling the API.
 * The API should filter by userId and include items.
 * @param userId - The numeric ID of the user.
 * @returns A promise that resolves to an array of UserOrder objects.
 */
export async function getUserOrders(userId: number): Promise<UserOrder[]> {
  console.log(`Fetching orders for user ${userId} via API (using Prisma backend)...`);
  // API endpoint might be /api/orders?userId=<userId>
  try {
    // Adjust the URL if your API supports filtering
    const response = await fetch(`/api/orders?userId=${userId}`);
    if (!response.ok) {
       const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
       throw new Error(`Failed to fetch orders for user ${userId}: ${response.statusText} - ${errorData.message || 'No additional error info'}`);
    }
    const prismaOrdersWithItems: PrismaOrderWithItems[] = await response.json();
     const userOrders = prismaOrdersWithItems.map(mapPrismaOrderToUserOrder);
    console.log(`Found ${userOrders.length} orders for user ${userId}`);
    return userOrders;
  } catch (error) {
      console.error(`Error fetching orders for user ${userId}.`);
      throw error; // Re-throw for react-query
  }
}

/**
 * Retrieves all custom orders by calling the API.
 * The API should filter for orders containing custom items.
 * @returns A promise that resolves to an array of UserOrder objects containing at least one custom item.
 */
export async function getAllCustomOrders(): Promise<UserOrder[]> {
    console.log(`Fetching all custom orders via API (using Prisma backend)...`);
    try {
        // Adjust URL if API has specific endpoint like /api/orders/custom
        const response = await fetch('/api/orders?custom=true'); // Assuming API supports ?custom=true filter
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            throw new Error(`Failed to fetch custom orders: ${response.statusText} - ${errorData.message || 'No additional error info'}`);
        }
        const prismaOrdersWithItems: PrismaOrderWithItems[] = await response.json();
        const customOrders = prismaOrdersWithItems.map(mapPrismaOrderToUserOrder);
        console.log(`Found ${customOrders.length} custom orders.`);
        return customOrders;
     } catch (error) {
         console.error("Error fetching custom orders.");
         throw error; // Re-throw for react-query
     }
}


/**
 * Adds a new order by calling the POST /api/orders endpoint.
 * The API route now uses Prisma and handles creating OrderItems.
 * @param userId - The numeric ID of the user placing the order.
 * @param customerName - The name of the customer placing the order.
 * @param cartItems - The items in the cart at the time of checkout.
 * @param orderTotalPrice - The total price of the order.
 * @returns A promise that resolves with the newly created order (including its items).
 */
export async function addOrder(userId: number, customerName: string, cartItems: CartItem[], orderTotalPrice: number): Promise<UserOrder> {
  console.log(`Adding new order for user ${userId} via API (using Prisma backend)...`);
  try {
      // Prepare OrderItem data for the API
      const itemsData = cartItems.map(item => ({
          // productId is only set for standard items (where item.id is a number)
          productId: typeof item.id === 'number' ? item.id : undefined,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          isCustom: item.isCustom || false,
          notes: item.notes,
      }));

      const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId,
              customerName,
              totalPrice: orderTotalPrice,
              items: itemsData, // Send array of item data
              // Status defaults to 'Pending' in Prisma schema
          }),
      });

      const data = await response.json();

       if (!response.ok) {
            throw new Error(data.message || `Failed to add order: ${response.statusText}`);
        }

       if (!data.id || !data.items) { // Check for items array in response
           throw new Error('Invalid order data received from API after creation.');
       }

      console.log('Order added via API:', data);
      // Map the returned PrismaOrderWithItems to UserOrder
      return mapPrismaOrderToUserOrder(data as PrismaOrderWithItems);
  } catch (error) {
      console.error("Error in addOrder:", error);
      throw error;
  }
}


/**
 * Updates the status of a specific order by calling the PATCH /api/orders/:orderId/status endpoint.
 * The API route now uses Prisma.
 * @param orderId - The numeric ID of the order to update.
 * @param newStatus - The new status for the order.
 * @returns A promise that resolves with the updated order (including items).
 */
export async function updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<UserOrder> {
    console.log(`Updating status for order ${orderId} to ${newStatus} via API (using Prisma backend)...`);
    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || `Failed to update order status: ${response.statusText}`);
        }

        if (!data.id || data.status !== newStatus || !data.items) { // Check for items
           throw new Error('Invalid order data received from API after status update.');
       }

        console.log('Order status updated via API:', data);
         // Map the returned PrismaOrderWithItems to UserOrder
        return mapPrismaOrderToUserOrder(data as PrismaOrderWithItems);
    } catch (error) {
        console.error(`Error updating status for order ${orderId}:`, error);
        throw error;
    }
}
