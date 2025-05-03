import Stripe from 'stripe';

// Ensure the secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('STRIPE_SECRET_KEY is not set in production environment.');
  } else {
    console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.');
  }
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20', // Use the latest API version
      typescript: true,
    })
  : null; // Return null if key is missing (e.g., in dev without Stripe setup)

// Helper function to get the base URL
export function getBaseUrl() {
    // Use NEXT_PUBLIC_APP_URL if set, otherwise default for local dev
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 9002}`;
    return appUrl.startsWith('http') ? appUrl : `https://${appUrl}`; // Ensure it has a protocol
}
