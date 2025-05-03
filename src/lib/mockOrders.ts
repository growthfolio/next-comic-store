import type { UserOrder, OrderStatus, OrderItem } from '@/services/order-service';

// Mock order items
const mockOrderItems: OrderItem[] = [
    {
        id: 101, // Mock OrderItem ID
        productId: 1, // Assuming a mock product ID 1 exists
        title: 'Cosmic Crusaders #1 (Mock Item)',
        price: 4.99,
        quantity: 2,
        imageUrl: 'https://picsum.photos/seed/mockOrderComic/100/150',
        isCustom: false,
        notes: null,
    },
     {
        id: 102, // Mock OrderItem ID
        // No productId for custom
        title: 'My Custom Mock Hero',
        price: 25.00,
        quantity: 1,
        imageUrl: 'https://picsum.photos/seed/mockCustomOrder/100/150',
        isCustom: true,
        notes: 'Mock notes for custom item.',
    },
];


// Define mock orders, linked to mock user ID 2 ('test.mock@example.com')
export let mockOrders: UserOrder[] = [
  {
    id: 9001, // Mock Order ID
    userId: 2, // Linked to 'Test Mock' user
    customerName: 'Test Mock',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    items: mockOrderItems, // Use the defined mock items
    totalPrice: mockOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    status: 'Completed',
    customImageUrl: mockOrderItems.find(item => item.isCustom)?.imageUrl ?? null, // Get from custom item
    notes: mockOrderItems.find(item => item.isCustom)?.notes ?? null, // Get from custom item
  },
  {
    id: 9002, // Another Mock Order ID
    userId: 2, // Linked to 'Test Mock' user
    customerName: 'Test Mock',
    date: new Date().toISOString(), // Today
    items: [
       {
           id: 103,
           productId: 2, // Assuming mock product ID 2
           title: 'Midnight Detective (Mock Item)',
           price: 5.50,
           quantity: 1,
           imageUrl: 'https://picsum.photos/seed/mockOrderComic2/100/150',
           isCustom: false,
           notes: null,
       }
    ],
    totalPrice: 5.50,
    status: 'Pending',
    customImageUrl: null,
    notes: null,
  },
   // Add a custom-only order for admin testing
   {
    id: 9003,
    userId: 2, // Linked to 'Test Mock' user
    customerName: 'Test Mock',
    date: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    items: [
       {
        id: 104,
        title: 'Purely Custom Mock Comic',
        price: 25.00,
        quantity: 1,
        imageUrl: 'https://picsum.photos/seed/mockCustomOnly/100/150',
        isCustom: true,
        notes: 'This order only contains a custom item for admin panel testing.',
       },
    ],
    totalPrice: 25.00,
    status: 'In Production',
    customImageUrl: 'https://picsum.photos/seed/mockCustomOnly/100/150',
    notes: 'This order only contains a custom item for admin panel testing.',
  }
];

// Helper to add a mock order (simulates POST)
// In a real mock setup, you might want this to modify the exported array,
// but for simplicity here, it just returns a new mock order structure.
export function addMockOrder(userId: number, customerName: string, items: OrderItem[], totalPrice: number): UserOrder {
    const newOrderId = Math.max(0, ...mockOrders.map(o => o.id)) + 1;
    const newOrder: UserOrder = {
        id: newOrderId,
        userId: userId,
        customerName: customerName,
        date: new Date().toISOString(),
        items: items.map((item, index) => ({ ...item, id: Date.now() + index })), // Assign temporary IDs
        totalPrice: totalPrice,
        status: 'Pending',
         // Extract details from the first custom item if present
        customImageUrl: items.find(i => i.isCustom)?.imageUrl ?? null,
        notes: items.find(i => i.isCustom)?.notes ?? null,
    };
     // IMPORTANT: In a real server, this would add to a persistent store.
     // Here, we'll just log and return, not modifying the exported array directly
     // to avoid complexities with module caching in some environments.
     console.log("[Mock Mode] Simulating adding order:", newOrder);
     // If you needed persistence across mock requests, you'd push to `mockOrders` here.
     // mockOrders.push(newOrder);
     return newOrder;
}

// Helper to update mock order status (simulates PATCH)
export function updateMockOrderStatus(orderId: number, newStatus: OrderStatus): UserOrder | null {
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return null;
    }
    // Update the status *in place* in the mock array
    mockOrders[orderIndex].status = newStatus;
    console.log(`[Mock Mode] Updated order ${orderId} status to ${newStatus}`);
    return mockOrders[orderIndex];
}
