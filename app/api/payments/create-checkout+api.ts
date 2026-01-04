/**
 * Create Stripe Checkout Session
 *
 * Backend API route to create a Stripe Checkout session for web-based subscriptions
 */

// Example implementation - you'll need to install stripe on your backend
// npm install stripe

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { priceId, email, userId, successUrl, cancelUrl, metadata } = body;

    if (!priceId) {
      return Response.json(
        { error: 'priceId is required' },
        { status: 400 }
      );
    }

    // Initialize Stripe (server-side only)
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.EXPO_PUBLIC_APP_URL}/payment/success`,
      cancel_url: cancelUrl || `${process.env.EXPO_PUBLIC_APP_URL}/payment/cancel`,
      customer_email: email,
      client_reference_id: userId,
      metadata: metadata || {},
      subscription_data: {
        metadata: {
          userId,
          ...metadata,
        },
      },
    });

    return Response.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return Response.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
