"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { NewCheckout } from "./new-checkout";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CheckoutPage() {
  const t = useTranslations('Checkout');

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-[var(--navy)] pt-14 pb-12 px-[5%] text-center">
        <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
          {t('ready.checkout') || 'Checkout'}
        </div>
        <h1 className="text-[38px] font-extrabold text-white mb-3 tracking-tight">
          {t('title') || 'Güvenli Ödeme'}
        </h1>
        <div className="flex justify-center">
           <Link href="/cart" className="inline-flex items-center gap-2 text-white/60 font-bold hover:text-[var(--gold)] transition-all no-underline text-sm">
             <ArrowLeft className="w-4 h-4" />
             {t('backToCart') || 'Sepete Dön'}
           </Link>
        </div>
      </section>

      <section className="py-16 px-[5%]">
        <div className="max-w-4xl mx-auto">
          <NewCheckout />
        </div>
      </section>

      <Footer />
    </main>
  );
}
