"use client";

import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function PaymentCancelPage() {
    const t = useTranslations('Checkout');

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-4">
            <div className="max-w-lg mx-auto text-center py-12">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">Ödeme İptal Edildi</h1>
                <p className="text-muted-foreground mb-8">
                    Ödeme işlemi kullanıcı tarafından iptal edildi veya bir sorun oluştu. Herhangi bir tutar tahsil edilmedi.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/checkout"><Button className="w-full sm:w-auto">Ödemeye Geri Dön</Button></Link>
                    <Link href="/"><Button variant="outline" className="w-full sm:w-auto">Ana Sayfaya Dön</Button></Link>
                </div>
            </div>
        </main>
    );
}
