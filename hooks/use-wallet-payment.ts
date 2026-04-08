'use client';

import { useState, useCallback, useRef } from 'react';
import { walletCheckoutService } from '@/lib/services/walletCheckoutService';
import {
  type PaymentStatus,
  type WalletPaymentError,
  type UseWalletPaymentReturn,
  PENDING_INTENT_KEY,
  mapStripeError,
} from '@/lib/types/payment';

/**
 * Hook that manages the full wallet payment lifecycle:
 * 1. Calls POST /checkout/wallet to get client_secret + intent_id
 * 2. Stores intent_id in localStorage as a safety net
 * 3. Returns client_secret for Stripe Elements to present payment sheet
 *
 * Does NOT handle Stripe confirmation — that is done by the WalletPaymentButton
 * component which uses Elements + stripe.confirmPayment().
 */
export function useWalletPayment(
  amount: number,
  currency: string,
  orderId?: number,
): UseWalletPaymentReturn {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<WalletPaymentError | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);

  // Prevent duplicate initiations
  const initiatingRef = useRef(false);

  const initiate = useCallback(async () => {
    if (initiatingRef.current) return;
    initiatingRef.current = true;

    setStatus('loading');
    setError(null);

    try {
      const response = await walletCheckoutService.initiate({
        amount,
        currency,
        order_id: orderId,
      });

      // Safety net: store intent before presenting payment sheet
      localStorage.setItem(
        PENDING_INTENT_KEY,
        JSON.stringify({
          intent_id: response.intent_id,
          order_id: response.order_id,
          created_at: Date.now(),
        }),
      );

      setClientSecret(response.client_secret);
      setIntentId(response.intent_id);
      setStatus('processing');
    } catch (err: any) {
      const isNetwork = !err.statusCode || err.statusCode >= 500;
      const mapped = mapStripeError(
        undefined,
        err.message || 'Failed to initiate payment. Please try again.',
      );
      mapped.isRetryable = isNetwork;
      mapped.code = isNetwork ? 'network_error' : 'checkout_error';
      setError(mapped);
      setStatus('error');
    } finally {
      initiatingRef.current = false;
    }
  }, [amount, currency, orderId]);

  return {
    initiate,
    status,
    error,
    isLoading: status === 'loading',
    clientSecret,
    intentId,
  };
}
