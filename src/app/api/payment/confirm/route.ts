// src/app/api/payment/confirm/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { useMock } from '@/lib/env';

// This route is primarily for MOCK confirmation after redirecting to /payment-success?mock=true.
// Real Stripe confirmation should use webhooks (/api/webhooks/stripe).

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderIdParam = searchParams.get('order_id');

  if (!orderIdParam) {
    return NextResponse.json({ message: 'Missing order_id parameter' }, { status: 400 });
  }

  const orderId = parseInt(orderIdParam, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ message: 'Invalid order_id' }, { status: 400 });
  }

  if (useMock) {
    // --- Mock Confirmation Logic ---
    try {
      console.log(`API Confirm Payment (Mock): Confirming order ${orderId}`);
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'Paid' }, // Update status to 'Paid'
      });

      if (!updatedOrder) {
        return NextResponse.json({ message: `Mock Order ${orderId} not found` }, { status: 404 });
      }

      console.log(`API Confirm Payment (Mock): Order ${orderId} marked as Paid.`);
      return NextResponse.json({ success: true, orderId: updatedOrder.id, status: updatedOrder.status });

    } catch (error) {
      console.error(`API Confirm Payment (Mock) Error for order ${orderId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm mock payment';
      return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
  } else {
    // --- Real Stripe Confirmation Logic (via Success URL - Less Recommended) ---
    // This path is less secure and reliable than webhooks.
    // If used, it needs the session_id to verify with Stripe.
    console.warn('API Confirm Payment (Real): Confirmation via success URL is not recommended. Use webhooks.');
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ message: 'Missing session_id parameter for Stripe confirmation' }, { status: 400 });
    }

    // !! Implementation to retrieve session from Stripe and update order would go here. !!
    // !! This is intentionally left incomplete as webhooks are preferred.          !!
    /*
    try {
        // const session = await stripe.checkout.sessions.retrieve(sessionId);
        // if (session.payment_status === 'paid') {
        //     const orderIdFromMeta = parseInt(session.metadata?.orderId || '', 10);
        //     if (orderId === orderIdFromMeta) {
        //         // Update order status in DB
        //     }
        // }
    } catch (error) {
        // Handle error
    }
    */
     return NextResponse.json({ message: 'Confirmation via URL not fully implemented for real payments. Use webhooks.', success: false }, { status: 400 });
  }
}
