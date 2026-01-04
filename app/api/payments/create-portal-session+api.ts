/**
 * Create Stripe Customer Portal Session
 *
 * Allows users to manage their subscription via Stripe Customer Portal
 */

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { customerId, returnUrl } = body;

    if (!customerId) {
      return Response.json(
        { error: 'customerId is required' },
        { status: 400 }
      );
    }

    // Initialize Stripe (server-side only)
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.EXPO_PUBLIC_APP_URL}/settings`,
    });

    return Response.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return Response.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
