/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for subscription updates, payment confirmations, etc.
 */

// =============================================================================
// Subscription Service (TODO: Replace with real database implementation)
// =============================================================================

async function activateSubscription(
  userId: string,
  subscriptionId: string
): Promise<void> {
  // TODO: Implement with your database (e.g., Prisma, Drizzle, Supabase)
  // Example:
  // await db.subscription.upsert({
  //   where: { userId },
  //   create: { userId, stripeSubscriptionId: subscriptionId, status: 'active' },
  //   update: { stripeSubscriptionId: subscriptionId, status: 'active' },
  // });
  console.log(
    `[DB] Activating subscription for user ${userId}: ${subscriptionId}`
  );
}

async function updateSubscriptionStatus(
  subscriptionId: string,
  status: string
): Promise<void> {
  // TODO: Implement with your database
  // await db.subscription.update({
  //   where: { stripeSubscriptionId: subscriptionId },
  //   data: { status },
  // });
  console.log(
    `[DB] Updating subscription ${subscriptionId} status to: ${status}`
  );
}

async function deactivateSubscription(subscriptionId: string): Promise<void> {
  // TODO: Implement with your database
  // await db.subscription.update({
  //   where: { stripeSubscriptionId: subscriptionId },
  //   data: { status: 'cancelled' },
  // });
  console.log(`[DB] Deactivating subscription: ${subscriptionId}`);
}

async function recordPayment(
  invoiceId: string,
  _subscriptionId: string,
  amount: number
): Promise<void> {
  // TODO: Implement with your database
  // await db.payment.create({ data: { invoiceId, subscriptionId, amount, status: 'succeeded' } });
  console.log(`[DB] Recording payment ${invoiceId} for ${amount}`);
}

async function handleFailedPayment(
  invoiceId: string,
  subscriptionId: string
): Promise<void> {
  // TODO: Implement notification + database update
  // await db.subscription.update({ where: { stripeSubscriptionId: subscriptionId }, data: { status: 'past_due' } });
  // await sendEmail(userId, 'Payment failed - please update your payment method');
  console.log(
    `[DB] Payment failed for invoice ${invoiceId}, subscription ${subscriptionId}`
  );
}

// =============================================================================
// Webhook Handler
// =============================================================================

export async function POST(req: Request): Promise<Response> {
  try {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return Response.json(
        { error: "Missing stripe signature" },
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
      console.error("Webhook signature verification failed:", err.message);
      return Response.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        if (userId && session.subscription) {
          await activateSubscription(userId, session.subscription);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await updateSubscriptionStatus(subscription.id, subscription.status);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await deactivateSubscription(subscription.id);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await recordPayment(
          invoice.id,
          invoice.subscription,
          invoice.amount_paid
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handleFailedPayment(invoice.id, invoice.subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return Response.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}
