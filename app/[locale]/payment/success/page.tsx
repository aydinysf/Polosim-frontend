"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCart } from "@/hooks/use-cart";

export default function PaymentSuccessPage() {
    const t = useTranslations('Checkout');
    const { clearCart } = useCart();
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(true);

    useEffect(() => {
        // Sepeti temizle
        clearCart();
        
        // Simüle edilmiş bir bekleme süresi (opsiyonel)
        const timer = setTimeout(() => {
            setIsUpdating(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [clearCart]);

    return (
        <main className="min-h-screen bg-background flex flex-col pt-32 pb-20 px-4">
            <div className="max-w-lg mx-auto text-center py-20 px-6">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{t('payment.successTitle')}</h1>
                <p className="text-muted-foreground mb-10 leading-relaxed">
                    {t('payment.successDescription')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                    <Link href="/"><Button className="w-full sm:w-auto">{t('success.backToHome')}</Button></Link>
                    <Link href="/profile"><Button variant="outline" className="w-full sm:w-auto">{t('success.myOrders')}</Button></Link>
                </div>
                {isUpdating && (
                    <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t('payment.updating')}</span>
                    </div>
                )}
            </div>
        </main>
    );
}
