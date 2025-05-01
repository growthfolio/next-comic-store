import type { Order as PrismaOrder, Product } from '@prisma/client';
import type { CartItem } from '@/hooks/useCart';

// Define possible order statuses (remains the same)
export type OrderStatus = 'Pending' | 'In Production' | 'Completed' | 'Cancelled';

// Interface for a single item within an order, mirroring structure stored in Order.itemsJson
export interface OrderItem extends Omit<CartItem, 'id'> {
  productId: string | number; // Product ID (number) or custom ID (string like 'custom-...')
  // Include other relevant fields if needed, e.g., description at time of order
}

// Interface for a complete user order (as returned by the API, mapped from PrismaOrder)
export interface UserOrder {
  id: number; // Use number for Prisma ID
  userId: number; // Foreign key to User
  customerName?: string | null; // Made nullable to match Prisma schema
  date: string; // ISO date string when the order was placed (from createdAt)
  items: OrderItem[]; // Parsed from itemsJson
  totalPrice: number;
  status: OrderStatus;
  // Include customImageUrl and notes if directly on the order
  customImageUrl?: string | null;
  notes?: string | null;
}

/**
 * Helper function to parse itemsJson from Prisma Order
 */
function mapPrismaOrderToUserOrder(prismaOrder: PrismaOrder): UserOrder {
    let items: OrderItem[] = [];
    try {
        items = JSON.parse(prismaOrder.itemsJson || '[]') as OrderItem[];
    } catch (e) {
        console.error(`Failed to parse itemsJson for order ${prismaOrder.id}:`, e);
        // Return empty items or handle error appropriately
    }
    return {
        id: prismaOrder.id,
        userId: prismaOrder.userId,
        customerName: prismaOrder.customerName,
        date: prismaOrder.createdAt.toISOString(), // Use createdAt for order date
        items: items,
        totalPrice: prismaOrder.totalPrice,
        status: prismaOrder.status as OrderStatus, // Assume status string matches OrderStatus type
        customImageUrl: prismaOrder.customImageUrl,
        notes: prismaOrder.notes,
    };
}


/**
 * Retrieves all orders from the API.
 * The API route /api/orders now uses Prisma.
 * @returns A promise that resolves to an array of UserOrder objects.
 */
export async function getAllOrders(): Promise<UserOrder[]> {
    console.log('Fetching all orders from API (using Prisma backend)...');
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            throw new Error(`Failed to fetch orders: ${response.statusText} - ${errorData.message || 'No additional error info'}`);
        }
        const prismaOrders: PrismaOrder[] = await response.json();
        // Map PrismaOrder[] to UserOrder[]
        return prismaOrders.map(mapPrismaOrderToUserOrder);
    } catch (error) {
        console.error("Error in getAllOrders:", error);
        throw error; // Re-throw for react-query
    }
}


/**
 * Retrieves orders for a specific user by calling the API.
 * The API should ideally support filtering by userId.
 * For now, we might filter client-side after fetching all if the API doesn't support it yet.
 * @param userId - The numeric ID of the user.
 * @returns A promise that resolves to an array of UserOrder objects.
 */
export async function getUserOrders(userId: number): Promise<UserOrder[]> {
  console.log(`Fetching orders for user ${userId} via API (using Prisma backend)...`);
  // Ideally, the API supports /api/orders?userId=<userId>
  // If not, fetch all and filter client-side (less efficient)
  try {
    // Assuming API fetches all for now, filter locally
    const allOrders = await getAllOrders();
    const userOrders = allOrders.filter(order => order.userId === userId);
    console.log(`Found ${userOrders.length} orders for user ${userId}`);
    return userOrders;
  } catch (error) {
      console.error(`Error fetching or filtering orders for user ${userId}.`);
      throw error; // Re-throw for react-query
  }
}

/**
 * Retrieves all custom orders by calling the API.
 * The API should ideally support filtering for custom orders.
 * For now, we filter client-side after fetching all.
 * @returns A promise that resolves to an array of UserOrder objects containing at least one custom item.
 */
export async function getAllCustomOrders(): Promise<UserOrder[]> {
    console.log(`Fetching all custom orders via API (using Prisma backend)...`);
    try {
        const allOrders = await getAllOrders();
        const customOrders = allOrders.filter(order =>
            order.items.some(item => item.isCustom)
        );
        console.log(`Found ${customOrders.length} custom orders.`);
        return customOrders;
     } catch (error) {
         console.error("Error filtering custom orders.");
         throw error; // Re-throw for react-query
     }
}


/**
 * Adds a new order by calling the POST /api/orders endpoint.
 * The API route now uses Prisma.
 * @param userId - The numeric ID of the user placing the order.
 * @param customerName - The name of the customer placing the order.
 * @param cartItems - The items in the cart at the time of checkout.
 * @param orderTotalPrice - The total price of the order.
 * @returns A promise that resolves with the newly created order.
 */
export async function addOrder(userId: number, customerName: string, cartItems: CartItem[], orderTotalPrice: number): Promise<UserOrder> {
  console.log(`Adding new order for user ${userId} via API (using Prisma backend)...`);
  try {
      // Map CartItem[] to the format expected by the API and Prisma (e.g., itemsJson)
      const orderItems: OrderItem[] = cartItems.map(item => ({
          productId: item.id, // The ID from the cart (could be product ID or custom string)
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          isCustom: item.isCustom,
          notes: item.notes,
      }));

      // Find the primary custom item details for the Order table, if any
      const primaryCustomItem = orderItems.find(item => item.isCustom);

      const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId,
              customerName,
              itemsJson: JSON.stringify(orderItems), // Send items as JSON string
              totalPrice: orderTotalPrice,
              // Send primary custom details if needed by API to store on Order directly
              customImageUrl: primaryCustomItem?.imageUrl,
              notes: primaryCustomItem?.notes,
              // Status defaults to 'Pending' in Prisma schema
          }),
      });

      const data = await response.json();

       if (!response.ok) {
            throw new Error(data.message || `Failed to add order: ${response.statusText}`);
        }

       if (!data.id || !data.itemsJson) { // Check for itemsJson in response from API
           throw new Error('Invalid order data received from API after creation.');
       }

      console.log('Order added via API:', data);
      // Map the returned PrismaOrder to UserOrder
      return mapPrismaOrderToUserOrder(data as PrismaOrder);
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
 * @returns A promise that resolves with the updated order.
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

        if (!data.id || data.status !== newStatus) {
           throw new Error('Invalid order data received from API after status update.');
       }

        console.log('Order status updated via API:', data);
         // Map the returned PrismaOrder to UserOrder
        return mapPrismaOrderToUserOrder(data as PrismaOrder);
    } catch (error) {
        console.error(`Error updating status for order ${orderId}:`, error);
        throw error;
    }
}
