// src/app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import type { Stripe } from 'stripe';
import { stripe } from '@/lib/stripe'; // Your configured Stripe instance
import prisma from '@/lib/prisma'; // Your Prisma client

// This is your Stripe CLI webhook secret for testing your endpoint locally.
// In production, set this in your environment variables.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  if (!stripe || !endpointSecret) {
      console.error('Stripe or webhook secret not configured.');
      return NextResponse.json({ message: 'Webhook Error: Configuration missing.' }, { status: 400 });
  }

  const sig = request.headers.get('stripe-signature');
  const reqBuffer = await request.arrayBuffer(); // Use arrayBuffer to get raw body

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(reqBuffer), // Use Buffer from arrayBuffer
      sig!,
      endpointSecret
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Webhook: Checkout session completed: ${session.id}`);

      // Retrieve the orderId from metadata
      const orderIdString = session.metadata?.orderId;
      if (!orderIdString) {
          console.error(`Webhook Error: Missing orderId in session metadata: ${session.id}`);
          return NextResponse.json({ message: 'Webhook Error: Missing orderId.' }, { status: 400 });
      }
      const orderId = parseInt(orderIdString, 10);

      // Check payment status
      if (session.payment_status === 'paid') {
        console.log(`Webhook: Payment successful for order ${orderId}`);
        try {
          // Update the order status in your database
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'Paid' }, // Use 'Paid' status
          });
          console.log(`Webhook: Order ${orderId} status updated to Paid in database.`);
        } catch (dbError) {
          console.error(`Webhook: Database error updating order ${orderId}:`, dbError);
          // Consider returning 500 to signal Stripe to retry, or handle specific errors
          return NextResponse.json({ message: 'Webhook Error: Failed to update order status.' }, { status: 500 });
        }
      } else {
        console.log(`Webhook: Checkout session ${session.id} completed but payment status is ${session.payment_status}. Order ${orderId} not marked as paid.`);
        // Optionally update status to 'Failed' or similar if needed
         // await prisma.order.update({
         //   where: { id: orderId },
         //   data: { status: 'Failed' },
         // });
      }
      break;
    // ... handle other event types if needed (e.g., payment_failed)
    case 'checkout.session.async_payment_succeeded':
        // Handle async payments if applicable
        console.log('Webhook: Async payment succeeded.');
        // Similar logic to 'checkout.session.completed' might be needed here
        break;
     case 'checkout.session.async_payment_failed':
        console.log('Webhook: Async payment failed.');
        // Update order status to 'Failed' or log the failure
        break;
    default:
      console.log(`Webhook: Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
