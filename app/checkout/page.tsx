"use client";

import { useCallback, useEffect, useState } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ShieldCheck, ArrowLeft, ShoppingBag, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useCart } from "@/lib/cart-context";
import { startCheckoutSession } from "@/app/actions/stripe";
import Link from "next/link";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [checkoutStatus, setCheckoutStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const fetchClientSecret = useCallback(async () => {
    try {
      const cartItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));
      const clientSecret = await startCheckoutSession(cartItems);
      setCheckoutStatus("ready");
      return clientSecret;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to initialize checkout");
      setCheckoutStatus("error");
      throw error;
    }
  }, [items]);

  const handleComplete = useCallback(() => {
    clearCart();
    setCheckoutStatus("success");
  }, [clearCart]);

  useEffect(() => {
    if (items.length === 0 && checkoutStatus !== "success") {
      router.push("/cart");
    }
  }, [items.length, checkoutStatus, router]);

  if (items.length === 0 && checkoutStatus !== "success") {
    return null;
  }

  if (checkoutStatus === "success") {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-40 pb-16 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Payment Successful!</h1>
            <p className="text-muted-foreground mb-2">
              Thank you for your purchase. Your eSIM QR code has been sent to your email.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Please check your inbox (and spam folder) for the activation instructions.
            </p>
            <div className="p-4 rounded-xl bg-card/50 border border-border/50 mb-8">
              <p className="text-sm text-muted-foreground mb-1">What happens next?</p>
              <ol className="text-left text-sm text-foreground space-y-2 mt-3">
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">1</span>
                  Check your email for the QR code
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">2</span>
                  Scan the QR code with your device camera
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">3</span>
                  Follow the prompts to install the eSIM
                </li>
                <li className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0">4</span>
                  Enable data roaming when you arrive at your destination
                </li>
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Back to Home
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" className="bg-transparent">
                  Need Help?
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (checkoutStatus === "error") {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-40 pb-16 px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Payment Failed</h1>
            <p className="text-muted-foreground mb-2">
              {errorMessage || "Something went wrong with your payment."}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Please try again or contact support if the problem persists.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/cart">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
              <Link href="/support">
                <Button variant="outline" className="bg-transparent">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                {checkoutStatus === "loading" && (
                  <div className="p-12 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading checkout...</p>
                  </div>
                )}
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{
                    fetchClientSecret,
                    onComplete: handleComplete,
                  }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm sticky top-32">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Order Summary
                </h2>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-2xl">{item.flag}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {formatPrice(item.priceInCents * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/50 pt-4">
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">Secure Payment</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your payment is protected by 256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
