import { NextRequest, NextResponse } from "next/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, orderId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // If Stripe is not configured, return a mock payment intent for development
    if (!stripeSecretKey) {
      console.warn(
        "[create-payment-intent] STRIPE_SECRET_KEY not set. Returning mock payment intent."
      );
      return NextResponse.json({
        clientSecret: `pi_mock_${Date.now()}_secret_mock`,
        paymentIntentId: `pi_mock_${Date.now()}`,
        amount,
        currency: currency ?? "usd",
        mock: true,
      });
    }

    // Dynamically import stripe to avoid issues when env var is not set
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-03-31.chunked" as any,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency ?? "usd",
      metadata: {
        orderId: orderId ? String(orderId) : "",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error("Failed to create payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
