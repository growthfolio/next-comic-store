// src/app/api/payment/create-session/route.ts
import { NextResponse } from 'next/server';
import { stripe, getBaseUrl } from '@/lib/stripe'; // Import Stripe instance and helper
import { useMock } from '@/lib/env';
import type { CartItem } from '@/hooks/useCart';
import prisma from '@/lib/prisma'; // Assuming prisma client is configured

interface CreateSessionRequestBody {
  items: CartItem[];
  orderId: number; // Order ID created beforehand
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateSessionRequestBody;
    const { items, orderId } = body;

    if (!items || items.length === 0 || !orderId) {
      return NextResponse.json({ message: 'Missing required session data (items, orderId)' }, { status: 400 });
    }

    const baseUrl = getBaseUrl();
    const successUrl = `${baseUrl}/payment-success?order_id=${orderId}`; // Pass orderId on success
    const cancelUrl = `${baseUrl}/checkout`; // Redirect back to checkout on cancel

    if (useMock) {
      // --- Mock Payment Logic ---
      console.log(`API Create Session (Mock): Simulating payment for order ${orderId}`);

      // In mock mode, we just redirect directly to a success page
      // Optionally, update the mock order status here or in a separate confirmation step
      // For simplicity, let's assume mock success means immediate confirmation.
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'Paid' }, // Use 'Paid' status
      });
      console.log(`API Create Session (Mock): Order ${orderId} marked as Paid.`);


      // Return a URL to the local success page
      return NextResponse.json({ checkoutUrl: `${successUrl}&mock=true` }); // Add mock=true flag

    } else {
      // --- Real Stripe Payment Logic ---
      if (!stripe) {
          return NextResponse.json({ message: 'Stripe is not configured.' }, { status: 500 });
      }
      console.log(`API Create Session (Stripe): Creating session for order ${orderId}`);

      // Ensure order exists before creating session
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order || order.status !== 'Pending') {
          return NextResponse.json({ message: `Order ${orderId} not found or not in Pending status.` }, { status: 404 });
      }


      const line_items = items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            // description: item.notes || (item.isCustom ? 'Custom Comic' : undefined), // Optional: Add description
            images: item.imageUrl ? [item.imageUrl] : undefined, // Optional: Add image
          },
          unit_amount: Math.round(item.price * 100), // Price in cents
        },
        quantity: item.quantity,
      }));

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items,
          mode: 'payment',
          success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`, // Stripe replaces placeholder
          cancel_url: cancelUrl,
          metadata: {
            orderId: orderId.toString(), // Store orderId to retrieve in webhook/confirmation
          },
        });

        console.log(`API Create Session (Stripe): Session created for order ${orderId}, ID: ${session.id}`);
        return NextResponse.json({ checkoutUrl: session.url });

      } catch (stripeError: any) {
         console.error('Stripe session creation error:', stripeError);
         return NextResponse.json({ message: `Stripe Error: ${stripeError.message}` }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('API Error creating payment session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment session';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
