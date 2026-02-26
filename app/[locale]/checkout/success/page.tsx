"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

    useEffect(() => {
        const paymentIntent = searchParams.get("payment_intent");
        const redirectStatus = searchParams.get("redirect_status");

        if (redirectStatus === "succeeded") {
            clearCart();
            setStatus("success");
        } else if (redirectStatus === "failed" || (paymentIntent && redirectStatus !== "succeeded")) {
            setStatus("failed");
        } else {
            // Direkt URL girişi veya bilinmeyen durum
            setStatus("success");
        }
    }, [searchParams, clearCart]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="max-w-lg mx-auto text-center py-12">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">Ödeme Başarısız</h1>
                <p className="text-muted-foreground mb-8">Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/checkout"><Button>Tekrar Dene</Button></Link>
                    <Link href="/support"><Button variant="outline">Destek Al</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto text-center py-12">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Ödeme Başarılı! 🎉</h1>
            <p className="text-muted-foreground mb-8">
                eSIM QR kodunuz e-posta adresinize gönderildi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/"><Button>Ana Sayfaya Dön</Button></Link>
                <Link href="/profile"><Button variant="outline">Siparişlerim</Button></Link>
            </div>
        </div>
    );
}
