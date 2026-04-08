"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface PayPalPaymentProps {
  amount: string;
  currency: string;
  onSuccess: (details: any) => void;
  onError: (error: string) => void;
}

export function PayPalPayment({ amount, currency, onSuccess, onError }: PayPalPaymentProps) {
  const [isPending, setIsPending] = useState(true);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";

  return (
    <div className="space-y-4">
      <PayPalScriptProvider
        options={{
          "client-id": clientId,
          currency: currency,
          intent: "capture",
        }}
      >
        <div className="relative min-h-[150px]">
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <PayPalButtons
            style={{ layout: "vertical", shape: "pill", label: "pay" }}
            onInit={() => setIsPending(false)}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount,
                      currency_code: currency,
                    },
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              if (actions.order) {
                const details = await actions.order.capture();
                onSuccess(details);
              }
            }}
            onError={(err) => {
              console.error("PayPal Error:", err);
              onError("PayPal ödeme işlemi sırasında bir hata oluştu.");
            }}
          />
        </div>
      </PayPalScriptProvider>

      {clientId === "test" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>Test modunda çalışıyor. Lütfen NEXT_PUBLIC_PAYPAL_CLIENT_ID ayarlayın.</span>
        </div>
      )}
    </div>
  );
}
