import { api } from "../api-client";
import type { Cart } from "./cartService";

export interface CheckoutPreview {
  cart: Cart;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  coupon_applied?: {
    code: string;
    discount_amount: number;
  };
}

export interface CheckoutExecuteRequest {
  payment_method: "stripe" | "wallet";
  email?: string;
  coupon_code?: string;
}

export interface CheckoutExecuteResponse {
  order_id: number;
  client_secret?: string; // For Stripe
  redirect_url?: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export const checkoutService = {
  async preview(couponCode?: string): Promise<CheckoutPreview> {
    const response = await api.post<CheckoutPreview>("/checkout/preview", {
      coupon_code: couponCode,
    });
    return response.data;
  },

  async execute(data: CheckoutExecuteRequest): Promise<CheckoutExecuteResponse> {
    const response = await api.post<CheckoutExecuteResponse>("/checkout/execute", data);
    return response.data;
  },
};
