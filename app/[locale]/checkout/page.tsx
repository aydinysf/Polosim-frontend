"use client";

import { Navbar } from "@/components/navbar";
import { NewCheckout } from "./new-checkout";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-40 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          </div>

          <NewCheckout />
        </div>
      </section>
    </main>
  );
}
