'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { walletCheckoutService } from '@/lib/services/walletCheckoutService';
import {
  type UsePendingPaymentReturn,
  PENDING_INTENT_KEY,
  MAX_RETRY_ATTEMPTS,
  BASE_RETRY_DELAY_MS,
} from '@/lib/types/payment';

interface PendingIntentData {
  intent_id: string;
  order_id: number;
  created_at: number;
}

/**
 * Reads stored pending intent from localStorage.
 * Returns null if nothing is stored or if the entry is older than 24 hours.
 */
function readPendingIntent(): PendingIntentData | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(PENDING_INTENT_KEY);
    if (!raw) return null;

    const data: PendingIntentData = JSON.parse(raw);

    // Expire entries older than 24 hours
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    if (Date.now() - data.created_at > TWENTY_FOUR_HOURS) {
      localStorage.removeItem(PENDING_INTENT_KEY);
      return null;
    }

    return data;
  } catch {
    localStorage.removeItem(PENDING_INTENT_KEY);
    return null;
  }
}

/**
 * Clears the pending payment intent from localStorage.
 */
export function clearPendingIntent(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PENDING_INTENT_KEY);
  }
}

/**
 * Exponential-backoff delay: 2s, 4s, 8s, 16s, 32s.
 */
function getRetryDelay(attempt: number): number {
  return BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
}

/**
 * Hook that checks for a pending (crash-interrupted) payment on page load
 * and window focus. If found, verifies against the backend with exponential
 * backoff and surfaces a recovery banner.
 */
export function usePendingPayment(): UsePendingPaymentReturn {
  const [hasPending, setHasPending] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveredOrderId, setRecoveredOrderId] = useState<number | null>(null);

  const recoveringRef = useRef(false);

  /**
   * Attempt to verify the pending intent with exponential backoff.
   */
  const recover = useCallback(async () => {
    if (recoveringRef.current) return;

    const pending = readPendingIntent();
    if (!pending) {
      setHasPending(false);
      return;
    }

    recoveringRef.current = true;
    setIsRecovering(true);

    let lastError: unknown = null;

    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const result = await walletCheckoutService.verify(pending.intent_id);

        if (result.status === 'succeeded') {
          clearPendingIntent();
          setHasPending(false);
          setRecoveredOrderId(result.order_id ?? pending.order_id);
          setIsRecovering(false);
          recoveringRef.current = false;
          return;
        }

        if (result.status === 'canceled' || result.status === 'requires_payment_method') {
          // Definitive failure — clean up
          clearPendingIntent();
          setHasPending(false);
          setIsRecovering(false);
          recoveringRef.current = false;
          return;
        }

        // 'processing' or 'requires_action' — keep retrying
        if (attempt < MAX_RETRY_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, getRetryDelay(attempt)));
        }
      } catch (err) {
        lastError = err;

        // Network error — retry
        if (attempt < MAX_RETRY_ATTEMPTS - 1) {
          await new Promise((resolve) => setTimeout(resolve, getRetryDelay(attempt)));
        }
      }
    }

    // Max retries exhausted — keep pending flag but stop recovering
    console.warn('[PendingPayment] Recovery exhausted retries. Last error:', lastError);
    setIsRecovering(false);
    recoveringRef.current = false;
  }, []);

  /**
   * Check for pending intent on mount.
   */
  useEffect(() => {
    const pending = readPendingIntent();
    if (pending) {
      setHasPending(true);
      recover();
    }
  }, [recover]);

  /**
   * Re-check on window focus (e.g. user returns from crashed tab).
   */
  useEffect(() => {
    const handleFocus = () => {
      const pending = readPendingIntent();
      if (pending) {
        setHasPending(true);
        recover();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [recover]);

  return {
    hasPending,
    recover,
    isRecovering,
    recoveredOrderId,
  };
}
