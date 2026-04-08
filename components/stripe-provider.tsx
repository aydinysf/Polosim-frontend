'use client';

import { type ReactNode, useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe, type StripeElementsOptions } from '@stripe/stripe-js';

// ─── Singleton Stripe Instance ────────────────────────────────────────────────
let stripePromiseCache: Promise<Stripe | null> | null = null;

function getStripePromise(publishableKey: string): Promise<Stripe | null> {
  if (!stripePromiseCache) {
    stripePromiseCache = loadStripe(publishableKey);
  }
  return stripePromiseCache;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface StripeProviderProps {
  children: ReactNode;
  clientSecret: string;
  publishableKey?: string;
}

/**
 * Wraps children with Stripe Elements context.
 * Only wrap payment-related routes with this — not the entire app.
 *
 * @example
 * ```tsx
 * <StripeProvider clientSecret={secret}>
 *   <WalletPaymentButton amount={1000} currency="eur" ... />
 * </StripeProvider>
 * ```
 */
export function StripeProvider({ children, clientSecret, publishableKey }: StripeProviderProps) {
  const key = publishableKey
    || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    || process.env.STRIPE_KEY
    || '';

  // Clean the key (remove stray characters that may have leaked from .env)
  const cleanKey = key.split('>')[0].trim();

  const stripePromise = useMemo(() => {
    if (!cleanKey || (!cleanKey.startsWith('pk_test_') && !cleanKey.startsWith('pk_live_'))) {
      console.error('[StripeProvider] Invalid or missing Stripe publishable key.');
      return null;
    }
    return getStripePromise(cleanKey);
  }, [cleanKey]);

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#c9a84c',
          borderRadius: '8px',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        rules: {
          '.Tab': {
            borderRadius: '8px',
          },
        },
      },
    }),
    [clientSecret],
  );

  if (!stripePromise) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
        Stripe is not configured. Please check your environment variables.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
