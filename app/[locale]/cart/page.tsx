"use client";

import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const t = useTranslations('Cart');
  const tc = useTranslations('Common');
  const locale = useLocale();

  const formatPrice = (amount: number) => {
    // Check if it's cents or already EUR
    // If totalPrice is very large (e.g. > 1000 for a few items), it's probably cents
    // But let's assume it follows the CartContext logic which uses priceInCents
    const value = amount > 5000 ? amount / 100 : amount; 
    return `€${value.toFixed(2)}`;
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-[var(--navy)] pt-14 pb-12 px-[5%] text-center">
        <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
          {t('title') || 'Shopping Cart'}
        </div>
        <h1 className="text-[38px] font-extrabold text-white mb-3 tracking-tight">
          {t('header') || 'Sepetiniz'}
        </h1>
        {totalItems > 0 && (
          <p className="text-white/60 font-medium">
            {totalItems} {totalItems === 1 ? 'plan' : 'plan'} {t('inCart') || 'sepetinizde bulunuyor'}
          </p>
        )}
      </section>

      <section className="py-16 px-[5%]">
        <div className="max-w-6xl mx-auto">
          {items.length === 0 ? (
            <div className="text-center py-20 bg-[var(--gray-bg)] rounded-3xl border border-[var(--gray-mid)]">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShoppingBag className="w-10 h-10 text-[var(--gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-dark)] mb-3 font-['Sora']">{t('emptyTitle') || 'Sepetiniz Boş'}</h2>
              <p className="text-[var(--gray-text)] mb-8 max-w-md mx-auto">
                {t('emptySubtitle') || 'Görünüşe göre henüz bir plan eklememişsiniz. Harika fırsatlarımıza göz atmaya ne dersiniz?'}
              </p>
              <Link href="/plans">
                <Button className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white rounded-3xl px-8 h-12 font-bold transition-all shadow-lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('browsePlans') || 'Planlara Göz At'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border-[1.5px] border-[var(--gray-mid)] bg-white flex items-center gap-5 transition-all hover:border-[var(--gold)] hover:shadow-md"
                  >
                    <div className="w-14 h-14 rounded-xl bg-[var(--gray-bg)] flex items-center justify-center text-3xl shadow-sm overflow-hidden">
                       {item.flag || '🌍'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--text-dark)] text-lg leading-tight font-['Sora']">{item.name}</h3>
                      <p className="text-sm text-[var(--gray-text)] font-medium mt-1">
                        {item.data} • {item.validity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-[var(--gray-bg)] rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-[var(--gray-mid)] flex items-center justify-center text-[var(--text-dark)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-[var(--text-dark)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-[var(--gray-mid)] flex items-center justify-center text-[var(--text-dark)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-extrabold text-[var(--text-dark)] text-lg">
                        {formatPrice((item.priceInCents || (item.price ? item.price * 100 : 0)) * item.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--gray-text)] hover:text-red-500 hover:bg-red-50 transition-all border-none cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                <div className="pt-4">
                  <Link href="/plans" className="inline-flex items-center gap-2 text-[var(--gold)] font-bold hover:opacity-70 transition-all no-underline">
                    <ArrowLeft className="w-4 h-4" />
                    {t('continueShopping') || 'Alışverişe Devam Et'}
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="p-8 rounded-3xl border-[1.5px] border-[var(--gray-mid)] bg-[var(--gray-bg)] sticky top-24 shadow-sm">
                  <h2 className="text-xl font-bold text-[var(--text-dark)] mb-6 font-['Sora']">{t('summaryTitle') || 'Sipariş Özeti'}</h2>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--gray-text)] font-medium">{t('subtotal') || 'Ara Toplam'}</span>
                      <span className="text-[var(--text-dark)] font-bold">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--gray-text)] font-medium">{t('taxes') || 'Vergiler'}</span>
                      <span className="text-[var(--text-dark)] font-bold">€0.00</span>
                    </div>
                    <div className="border-t border-[var(--gray-mid)] pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-dark)] font-bold text-lg">{t('total') || 'Toplam'}</span>
                        <span className="text-[var(--gold)] font-extrabold text-2xl">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/checkout" className="block no-underline">
                    <Button className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white rounded-3xl h-14 font-extrabold text-base transition-all shadow-lg flex items-center justify-center gap-2">
                      {t('checkout') || 'Ödeme Adımına Geç'}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <p className="text-[11px] text-[var(--gray-text)] text-center mt-4 font-medium uppercase tracking-wider">
                    {t('secureCheckout') || 'Güvenli Ödeme • 256-bit SSL'}
                  </p>
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
