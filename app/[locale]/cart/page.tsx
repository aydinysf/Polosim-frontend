"use client";

import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { Link } from "@/i18n/routing";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  const formatPrice = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-40 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
            {totalItems > 0 && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-card/50 border border-border/50 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Browse our eSIM plans and add some to your cart
              </p>
              <Link href="/plans">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse Plans
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm flex items-center gap-4"
                  >
                    <div className="text-4xl">{item.flag}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{item.name} eSIM</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.data} - {item.validity} - {item.speed}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="font-semibold text-foreground">
                        {formatPrice(item.priceInCents * item.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.priceInCents)} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="p-6 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm sticky top-32">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxes</span>
                      <span className="text-foreground">€0.00</span>
                    </div>
                    <div className="border-t border-border/50 pt-3">
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/checkout" className="block">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/plans" className="block mt-3">
                    <Button variant="outline" className="w-full bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
