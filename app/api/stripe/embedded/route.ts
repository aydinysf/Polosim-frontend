import { NextResponse } from "next/server";
import { startCheckoutSession } from "@/app/actions/stripe";

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe secret key missing. Set STRIPE_SECRET_KEY in environment." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const cartItems = Array.isArray(body?.cartItems) ? body.cartItems : [];

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "No cart items provided." },
        { status: 400 }
      );
    }

    const clientSecret = await startCheckoutSession(cartItems, "");

    if (!clientSecret) {
      return NextResponse.json(
        { error: "Failed to create Stripe embedded checkout session." },
        { status: 500 }
      );
    }

    return NextResponse.json({ client_secret: clientSecret });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
