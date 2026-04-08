// ─── Payment Status ───────────────────────────────────────────────────────────
export type PaymentStatus =
  | 'idle'
  | 'loading'
  | 'processing'
  | 'success'
  | 'error'
  | 'pending';

// ─── API Response Types ───────────────────────────────────────────────────────
export interface WalletCheckoutResponse {
  client_secret: string;
  intent_id: string;
  order_id: number;
}

export interface PaymentVerifyResponse {
  status: 'succeeded' | 'processing' | 'requires_action' | 'canceled' | 'requires_payment_method';
  order_id?: number;
  message?: string;
}

// ─── Component Props ──────────────────────────────────────────────────────────
export interface WalletPaymentProps {
  amount: number;         // Amount in smallest currency unit (cents)
  currency: string;       // ISO 4217 currency code, e.g. 'eur'
  orderId?: number;
  onSuccess: (orderId: number) => void;
  onError: (error: WalletPaymentError) => void;
  className?: string;
}

// ─── Hook Return Types ────────────────────────────────────────────────────────
export interface UseWalletPaymentReturn {
  initiate: () => Promise<void>;
  status: PaymentStatus;
  error: WalletPaymentError | null;
  isLoading: boolean;
  clientSecret: string | null;
  intentId: string | null;
}

export interface UsePendingPaymentReturn {
  hasPending: boolean;
  recover: () => Promise<void>;
  isRecovering: boolean;
  recoveredOrderId: number | null;
}

// ─── Error Types ──────────────────────────────────────────────────────────────
export interface WalletPaymentError {
  code: string;
  message: string;
  isRetryable: boolean;
}

// ─── Stripe Error Mapping ─────────────────────────────────────────────────────
export const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  card_declined: 'Your card was declined. Please try another payment method.',
  insufficient_funds: 'Insufficient funds. Please try another card.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: 'The CVC number is incorrect. Please check and try again.',
  processing_error: 'An error occurred while processing your card. Please try again.',
  incorrect_number: 'The card number is incorrect. Please check and try again.',
  authentication_required: 'Authentication is required. Please complete the verification.',
};

export const RETRYABLE_ERROR_CODES = new Set([
  'processing_error',
  'rate_limit',
  'api_connection_error',
  'api_error',
]);

export function mapStripeError(code?: string, fallbackMessage?: string): WalletPaymentError {
  const message = (code && STRIPE_ERROR_MESSAGES[code])
    || fallbackMessage
    || 'An unexpected error occurred. Please try again.';

  return {
    code: code || 'unknown_error',
    message,
    isRetryable: code ? RETRYABLE_ERROR_CODES.has(code) : false,
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const PENDING_INTENT_KEY = 'pending_payment_intent';
export const MAX_RETRY_ATTEMPTS = 5;
export const BASE_RETRY_DELAY_MS = 2000;
