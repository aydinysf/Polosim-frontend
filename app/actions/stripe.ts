"use server";

import { stripe } from "@/lib/stripe";
import { PRODUCTS } from "@/lib/products";

interface CartItemInput {
  productId: string;
  quantity: number;
}

export async function startCheckoutSession(cartItems: CartItemInput[]) {
  const lineItems = cartItems.map((cartItem) => {
    const product = PRODUCTS.find((p) => p.id === cartItem.productId);
    if (!product) {
      throw new Error(`Product with id "${cartItem.productId}" not found`);
    }

    return {
      price_data: {
        currency: "eur",
        product_data: {
          name: `${product.flag} ${product.name} eSIM`,
          description: `${product.data} - ${product.validity} - ${product.speed}`,
        },
        unit_amount: product.priceInCents,
      },
      quantity: cartItem.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: lineItems,
    mode: "payment",
  });

  return session.client_secret;
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    status: session.status,
    customerEmail: session.customer_details?.email,
  };
}
