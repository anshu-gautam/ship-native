/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for subscription updates, payment confirmations, etc.
 */

export async function POST(req: Request): Promise<Response> {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return Response.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    const body = await req.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout completed:', session.id);

        // TODO: Activate subscription for user
        // const userId = session.client_reference_id;
        // await activateSubscription(userId, session.subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);

        // TODO: Update subscription status in your database
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription cancelled:', subscription.id);

        // TODO: Deactivate subscription for user
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Payment succeeded:', invoice.id);

        // TODO: Record payment in your database
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Payment failed:', invoice.id);

        // TODO: Notify user about failed payment
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return Response.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
