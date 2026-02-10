"use server";

import { stripe } from "@/lib/stripe";
import { productService } from "@/lib/services/productService";
import { getLocalizedText, getProductName, getProductData, getProductValidity, getProductSpeed } from "@/lib/product-helpers";

interface CartItemInput {
  productId: number;
  quantity: number;
}

export async function startCheckoutSession(cartItems: CartItemInput[], returnUrl: string) {
  try {
    const lineItems = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await productService.getById(cartItem.productId);
        if (!product) {
          throw new Error(`Product with id "${cartItem.productId}" not found`);
        }

        const name = getProductName(product);
        const data = getProductData(product);
        const validity = getProductValidity(product);
        const speed = getProductSpeed(product);
        
        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${name} eSIM`,
              description: `${data} - ${validity} - ${speed}`,
            },
            unit_amount: Math.round((product.price || 0) * 100),
          },
          quantity: cartItem.quantity,
        };
      })
    );

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      redirect_on_completion: "never",
      line_items: lineItems,
      mode: "payment",
    });

    return session.client_secret;
  } catch (error) {
    console.error("--- DETAILED CHECKOUT ERROR ---");
    console.error(error);
    console.error("-------------------------------");
    // Orijinal hatayı yeniden fırlat ki Next.js bunu yakalasın ama biz loglarda görelim.
    throw error;
  }
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    status: session.status,
    customerEmail: session.customer_details?.email,
  };
}
