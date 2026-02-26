import api from '../api-client';

interface CheckoutItem {
  product_id: number;
  quantity: number;
}

interface CheckoutPreviewPayload {
  items?: CheckoutItem[];
  session_id?: string;
}

export interface CheckoutPreviewResponse {
  items: any[];
  subtotal: number;
  total: number;
  currency: string;
  discount_amount?: number;
  discount?: any;
}

interface CheckoutExecutePayload {
  payment_method: 'stripe' | 'wallet';
  session_id?: string;
  guest_email?: string;
  guest_name?: string;
  guest_surname?: string;
  product_id?: number;
  quantity?: number;
}

interface CheckoutExecuteResponse {
  client_secret: string;
  order_id: number;
  status: string;
}

export const checkoutService = {
  preview: async (payload: CheckoutPreviewPayload): Promise<CheckoutPreviewResponse> => {
    const response = await api.post('/checkout/preview', payload);
    return response.data;
  },
  execute: async (payload: CheckoutExecutePayload): Promise<CheckoutExecuteResponse> => {
    const response = await api.post('/checkout/execute', payload);
    return response.data;
  },
};
