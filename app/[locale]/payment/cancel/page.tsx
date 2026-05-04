"use client";

import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function PaymentCancelPage() {
    const t = useTranslations('Checkout');

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-4">
            <div className="max-w-lg mx-auto text-center py-20 px-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8">
                    <XCircle className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{t('payment.cancelTitle')}</h1>
                <p className="text-muted-foreground mb-10 leading-relaxed">
                    {t('payment.cancelDescription')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/checkout"><Button className="w-full sm:w-auto">{t('payment.backToCheckout')}</Button></Link>
                    <Link href="/"><Button variant="outline" className="w-full sm:w-auto">{t('success.backToHome')}</Button></Link>
                </div>
            </div>
        </main>
    );
}
