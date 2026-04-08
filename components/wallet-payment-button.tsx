'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, AlertCircle, Clock } from 'lucide-react';
import {
  type WalletPaymentProps,
  type PaymentStatus,
  type WalletPaymentError,
  PENDING_INTENT_KEY,
  mapStripeError,
} from '@/lib/types/payment';

/**
 * WalletPaymentButton — Renders Stripe PaymentElement which automatically
 * shows Apple Pay (Safari/iOS), Google Pay (Chrome/Android), or falls back
 * to a card form when neither wallet is available.
 *
 * Must be wrapped inside <StripeProvider clientSecret={...}>.
 */
export function WalletPaymentButton({
  amount,
  currency,
  orderId,
  onSuccess,
  onError,
  className,
}: WalletPaymentProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<WalletPaymentError | null>(null);
  const [isElementReady, setIsElementReady] = useState(false);

  // Surface errors to parent via callback
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  const handleError = useCallback(
    (stripeError: { code?: string; message?: string } | null | undefined, fallback?: string) => {
      const mapped = mapStripeError(stripeError?.code, stripeError?.message || fallback);
      setError(mapped);
      setStatus('error');
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements) return;

      setStatus('loading');
      setError(null);

      // Step 1: Validate form via Elements
      const { error: submitError } = await elements.submit();
      if (submitError) {
        handleError(submitError, 'Form validation failed.');
        return;
      }

      // Step 2: Confirm the payment
      // stripe.confirmPayment handles 3DS automatically
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required', // Don't redirect unless 3DS requires it
      });

      if (confirmError) {
        handleError(confirmError, 'Payment failed.');
        return;
      }

      // Step 3: Handle result based on paymentIntent status
      if (!paymentIntent) {
        // Redirected for 3DS — handled by return_url
        return;
      }

      switch (paymentIntent.status) {
        case 'succeeded':
          // Clear safety-net localStorage
          localStorage.removeItem(PENDING_INTENT_KEY);
          setStatus('success');
          if (orderId) {
            onSuccess(orderId);
          }
          break;

        case 'processing':
          // Do NOT show an error — webhook will confirm server-side
          setStatus('processing');
          // Keep pending intent in localStorage for recovery
          break;

        case 'requires_action':
          // 3DS should have been handled automatically, but just in case
          setStatus('processing');
          break;

        default:
          handleError(undefined, 'Payment could not be completed. Please try again.');
          break;
      }
    },
    [stripe, elements, orderId, onSuccess, handleError],
  );

  // Format display amount
  const displayAmount = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        {/* PaymentElement — shows Apple Pay / Google Pay / Card form automatically */}
        <PaymentElement
          onReady={() => setIsElementReady(true)}
          options={{
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: false,
              spacedAccordionItems: true,
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />

        {/* Processing Banner */}
        {status === 'processing' && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <Clock className="h-4 w-4 shrink-0 animate-pulse" />
            <span>Payment is being processed. You&apos;ll be notified once confirmed.</span>
          </div>
        )}

        {/* Error Display */}
        {error && status === 'error' && (
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p>{error.message}</p>
              {error.isRetryable && (
                <p className="mt-1 text-xs opacity-75">This may be a temporary issue. Please try again.</p>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!stripe || !elements || !isElementReady || status === 'loading' || status === 'processing'}
          className="w-full"
          size="lg"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : status === 'processing' ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-pulse" />
              Processing…
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay {displayAmount}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
