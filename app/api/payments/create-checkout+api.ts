/**
 * Create Stripe Checkout Session
 *
 * Backend API route to create a Stripe Checkout session for web-based subscriptions
 */

// Example implementation - you'll need to install stripe on your backend
// npm install stripe

import { verifyAuthToken } from "../middleware/auth";
import { z } from "zod";

// Input validation schema
const checkoutSchema = z.object({
  priceId: z
    .string()
    .min(1, "priceId is required")
    .regex(/^price_/, "Invalid Stripe price ID"),
  email: z.string().email("Invalid email format").optional(),
  successUrl: z.string().url("Invalid success URL").optional(),
  cancelUrl: z.string().url("Invalid cancel URL").optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(req: Request): Promise<Response> {
  try {
    // Authenticate user
    const token = await verifyAuthToken(req);
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate and sanitize input
    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { priceId, email, successUrl, cancelUrl, metadata } = result.data;

    // Use authenticated userId instead of client-provided one
    const userId = token.userId;

    // Initialize Stripe (server-side only)
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url:
        successUrl || `${process.env.EXPO_PUBLIC_APP_URL}/payment/success`,
      cancel_url:
        cancelUrl || `${process.env.EXPO_PUBLIC_APP_URL}/payment/cancel`,
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
    console.error("Error creating checkout session:", error);
    return Response.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
