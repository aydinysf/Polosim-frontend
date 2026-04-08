import api from '../api-client';
import type { WalletCheckoutResponse, PaymentVerifyResponse } from '../types/payment';

/**
 * Service for wallet-based checkout (Apple Pay / Google Pay via Stripe).
 * Uses the dedicated /checkout/wallet endpoint that returns a PaymentIntent.
 */
export const walletCheckoutService = {
  /**
   * Initiate a wallet payment. Returns client_secret + intent_id for Stripe Elements.
   */
  initiate: async (params: {
    amount: number;
    currency: string;
    order_id?: number;
  }): Promise<WalletCheckoutResponse> => {
    const response = await api.post<WalletCheckoutResponse>('/checkout/wallet', params);
    return response.data;
  },

  /**
   * Verify the status of a PaymentIntent (used for pending payment recovery).
   */
  verify: async (intentId: string): Promise<PaymentVerifyResponse> => {
    const response = await api.get<PaymentVerifyResponse>(`/payment/verify/${intentId}`);
    return response.data;
  },
};
