import { api, getAuthToken } from "../api-client";

export interface CheckoutPreviewRequest {
  items?: Array<{
    product_id: number;
    quantity: number;
  }>;
  // For guest checkout with session
  session_id?: string;
}

export interface CheckoutPreviewResponse {
  subtotal: number;
  discount: number; // or discount_amount
  discount_amount?: number;
  total: number;
  items: Array<{
    product_id: number;
    name: string;
    quantity: number;
    price?: number;
    unit_price?: number; // From API
    total?: number;
    line_amount?: number; // From API
  }>;
}

export interface CheckoutExecuteRequest {
  payment_method: 'wallet' | 'stripe';
  // Guest information (required for guests)
  guest_email?: string;
  guest_name?: string;
  guest_surname?: string;
  // Fallback/Alternative fields
  email?: string;
  name?: string;
  surname?: string;
  customer_email?: string;
  receipt_email?: string;
  user?: {
    email: string;
    name: string;
    surname: string;
  };
  // For guest checkout with session
  session_id?: string;
  [key: string]: any; // Allow additional properties
}

export interface CheckoutExecuteResponse {
  order_id: number;
  status: string;
  total: number;
  // For Stripe payments
  client_secret?: string;
  // For wallet payments
  wallet_balance_used?: number;
  wallet_remaining_balance?: number;
}

export const checkoutService = {
  async preview(data: CheckoutPreviewRequest): Promise<CheckoutPreviewResponse> {
    const token = getAuthToken();
    
    const config = {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(data.session_id && { 'X-Session-ID': data.session_id })
      }
    };

    const response = await api.post<CheckoutPreviewResponse>('/checkout/preview', data, config);
    return response.data;
  },

  async execute(data: CheckoutExecuteRequest): Promise<CheckoutExecuteResponse> {
    const token = getAuthToken();
    
    const config = {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(data.session_id && { 'X-Session-ID': data.session_id })
      }
    };

    const response = await api.post<CheckoutExecuteResponse>('/checkout/execute', data, config);
    return response.data;
  }
};