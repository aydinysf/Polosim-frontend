"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function PaymentSuccessPage() {
    const t = useTranslations('Checkout');

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-4">
            <div className="max-w-lg mx-auto text-center py-12">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">Ödeme Alındı! 🎉</h1>
                <p className="text-muted-foreground mb-8">
                    Ödemeniz başarıyla alındı ve işleniyor. İşlem tamamlandığında eSIM bilgileriniz e-posta adresinize gönderilecektir.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/"><Button className="w-full sm:w-auto">Ana Sayfaya Dön</Button></Link>
                    <Link href="/profile"><Button variant="outline" className="w-full sm:w-auto">Siparişlerim / Profil</Button></Link>
                </div>
                <p className="text-sm text-muted-foreground mt-8 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sistem güncelleniyor, lütfen bekleyin...
                </p>
            </div>
        </main>
    );
}
