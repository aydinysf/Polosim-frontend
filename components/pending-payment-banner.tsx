'use client';

import { useEffect, useState } from 'react';
import { usePendingPayment } from '@/hooks/use-pending-payment';
import { CheckCircle, Loader2, X } from 'lucide-react';

/**
 * Non-intrusive banner that appears when a pending payment is detected
 * (e.g. the user's browser crashed mid-payment). Shows recovery status
 * and auto-dismisses on success.
 */
export function PendingPaymentBanner() {
  const { hasPending, isRecovering, recoveredOrderId } = usePendingPayment();
  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-dismiss success after 5 seconds
  useEffect(() => {
    if (recoveredOrderId) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setDismissed(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recoveredOrderId]);

  if (dismissed) return null;

  // Show recovering state
  if (hasPending && isRecovering) {
    return (
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in">
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-50 px-5 py-3 shadow-lg dark:bg-amber-950/80 dark:border-amber-500/20">
          <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Verifying a previous payment…
          </span>
        </div>
      </div>
    );
  }

  // Show recovery success
  if (showSuccess && recoveredOrderId) {
    return (
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50 px-5 py-3 shadow-lg dark:bg-emerald-950/80 dark:border-emerald-500/20">
          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Previous payment confirmed! Order #{recoveredOrderId}
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 rounded-full p-1 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  // Show pending (not recovering, not recovered)
  if (hasPending && !isRecovering) {
    return (
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in">
        <div className="flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-50 px-5 py-3 shadow-lg dark:bg-blue-950/80 dark:border-blue-500/20">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            A pending payment was found. It will be verified automatically.
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 rounded-full p-1 hover:bg-blue-200/50 dark:hover:bg-blue-800/50 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
