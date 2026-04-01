"use client";

import { useState, FormEvent } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

interface StripePaymentFormProps {
    onSuccess: () => void;
}

export function StripePaymentForm({ onSuccess }: StripePaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);
        setErrorMessage(null);

        // Önce elements'i submit et (validasyon)
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message || "Form doğrulama hatası.");
            setIsLoading(false);
            return;
        }

        // Ödemeyi onayla
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: "if_required", // 3DS gerektirmiyorsa yönlendirme yapma
        });

        if (error) {
            setErrorMessage(error.message || "Ödeme işlemi başarısız.");
        } else {
            // Ödeme başarılı (3DS gerekmedi)
            onSuccess();
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement
                options={{
                    layout: {
                        type: "accordion",
                        defaultCollapsed: false,
                        radios: false,
                        spacedAccordionItems: true,
                    },
                    wallets: {
                        applePay: "auto",
                        googlePay: "auto",
                    },
                }}
            />

            {errorMessage && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                    {errorMessage}
                </div>
            )}

            <Button
                type="submit"
                disabled={!stripe || !elements || isLoading}
                className="w-full"
                size="lg"
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "İşleniyor..." : "Ödemeyi Tamamla"}
            </Button>
        </form>
    );
}
