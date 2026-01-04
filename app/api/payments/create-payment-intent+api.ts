/**
 * Create Stripe Payment Intent
 *
 * Backend API route for one-time payments
 */

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { amount, currency, metadata } = body;

    if (!amount || !currency) {
      return Response.json(
        { error: 'amount and currency are required' },
        { status: 400 }
      );
    }

    // Initialize Stripe (server-side only)
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return Response.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
