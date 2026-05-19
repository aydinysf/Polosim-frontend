"use client";

import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Shield, Truck, CreditCard, Globe, Clock, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const t = useTranslations('Cart');
  const locale = useLocale();

  const formatPrice = (amount: number) => {
    const value = amount > 5000 ? amount / 100 : amount; 
    return `€${value.toFixed(2)}`;
  };

  return (
    <main className="min-h-screen bg-[#F8F5ED]">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-[var(--navy)] pt-36 pb-16 px-[5%]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/plans" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              {t('browsePlans') || 'Planlar'}
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white text-sm font-medium">{t('title') || 'Sepetim'}</span>
          </div>
          <h1 className="text-[42px] font-extrabold text-white tracking-tight">
            {t('header') || 'Alışveriş Sepetiniz'}
          </h1>
          {totalItems > 0 && (
            <p className="text-white/70 font-medium mt-2 text-lg">
              {totalItems} {t('inCart') || 'ürün sepetinizde'}
            </p>
          )}
        </div>
      </section>

      <section className="py-12 px-[5%]">
        <div className="max-w-6xl mx-auto">
          {items.length === 0 ? (
            /* Empty Cart State */
            <div className="bg-white rounded-3xl border border-[var(--gray-mid)] shadow-sm overflow-hidden">
              <div className="text-center py-20 px-6">
                <div className="w-24 h-24 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-8">
                  <ShoppingBag className="w-12 h-12 text-[var(--gold)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--navy)] mb-3">{t('emptyTitle') || 'Sepetiniz Boş'}</h2>
                <p className="text-[var(--gray-text)] mb-8 max-w-md mx-auto leading-relaxed">
                  {t('emptySubtitle') || 'Henüz sepetinize ürün eklemediniz. Hemen planlarımızı keşfedin!'}
                </p>
                <Link href="/plans">
                  <Button className="bg-[var(--navy)] hover:bg-[var(--navy-mid)] text-white rounded-xl px-8 h-12 font-semibold transition-all">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('browsePlans') || 'Planları Keşfet'}
                  </Button>
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="bg-[var(--gray-bg)] border-t border-[var(--gray-mid)] py-8 px-6">
                <div className="flex flex-wrap items-center justify-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--navy)]">Güvenli Ödeme</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Truck className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--navy)]">Anında Teslimat</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--navy)]">Kolay İade</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items Column */}
              <div className="lg:col-span-2 space-y-4">
                {/* Cart Items Header */}
                <div className="bg-white rounded-2xl border border-[var(--gray-mid)] p-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[var(--navy)]">{t('yourPlans') || 'Seçtiğiniz Planlar'}</h2>
                  <span className="text-sm text-[var(--gray-text)]">{totalItems} {t('items') || 'ürün'}</span>
                </div>

                {/* Cart Items List */}
                <div className="bg-white rounded-2xl border border-[var(--gray-mid)] overflow-hidden divide-y divide-[var(--gray-mid)]">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-[var(--gray-bg)]/50 transition-colors"
                    >
                      {/* Product Image/Flag */}
                      <div className="w-16 h-16 rounded-xl bg-[#F8F5ED] border border-[var(--gold)]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.flag ? (
                          typeof item.flag === 'string' && (item.flag.includes('/') || item.flag.includes('.')) ? (
                            <Image src={item.flag} alt={item.name} width={64} height={64} className="object-cover" />
                          ) : (
                            <span className="text-3xl">{item.flag}</span>
                          )
                        ) : (
                          <Globe className="w-8 h-8 text-[var(--navy)]" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--navy)] text-base truncate">{item.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--gray-bg)] text-[11px] font-medium text-[var(--navy)]">
                            <Signal className="w-3 h-3 text-[var(--gold)]" />
                            {item.data}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--gray-bg)] text-[11px] font-medium text-[var(--navy)]">
                            <Clock className="w-3 h-3 text-[var(--gold)]" />
                            {item.validity}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-[var(--gray-bg)] rounded-lg p-1 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-md bg-white border border-[var(--gray-mid)] flex items-center justify-center text-[var(--navy)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-[var(--navy)] text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-md bg-white border border-[var(--gray-mid)] flex items-center justify-center text-[var(--navy)] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0 min-w-[90px]">
                        <p className="font-bold text-[var(--navy)] text-lg">
                          {formatPrice((item.priceInCents || (item.price ? item.price * 100 : 0)) * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-[var(--gray-text)]">
                            {formatPrice(item.priceInCents || (item.price ? item.price * 100 : 0))} / adet
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--gray-text)] hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Continue Shopping Link */}
                <div className="pt-2">
                  <Link href="/plans" className="inline-flex items-center gap-2 text-[var(--gold)] font-semibold hover:opacity-70 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                    {t('continueShopping') || 'Alışverişe Devam Et'}
                  </Link>
                </div>
              </div>

              {/* Order Summary Column */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-[var(--gray-mid)] overflow-hidden sticky top-28">
                  {/* Summary Header */}
                  <div className="bg-[var(--navy)] p-5">
                    <h2 className="text-lg font-bold text-white">{t('summaryTitle') || 'Sipariş Özeti'}</h2>
                  </div>

                  {/* Summary Content */}
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--gray-text)] font-medium">{t('subtotal') || 'Ara Toplam'}</span>
                      <span className="text-[var(--navy)] font-semibold">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--gray-text)] font-medium">{t('taxes') || 'Vergiler'}</span>
                      <span className="text-[var(--navy)] font-semibold">€0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--gray-text)] font-medium">{t('shipping') || 'Teslimat'}</span>
                      <span className="text-emerald-600 font-semibold">{t('free') || 'Ücretsiz'}</span>
                    </div>
                    
                    <div className="border-t border-[var(--gray-mid)] pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--navy)] font-bold text-lg">{t('total') || 'Toplam'}</span>
                        <span className="text-[var(--gold)] font-extrabold text-2xl">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Link href="/checkout" className="block pt-2">
                      <Button className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white rounded-xl h-12 font-bold text-base transition-all flex items-center justify-center gap-2">
                        {t('checkout') || 'Ödemeye Geç'}
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Shield className="w-4 h-4 text-[var(--gray-text)]" />
                      <span className="text-xs text-[var(--gray-text)]">
                        {t('secureCheckout') || '256-bit SSL ile güvenli ödeme'}
                      </span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="border-t border-[var(--gray-mid)] p-5 bg-[var(--gray-bg)]">
                    <p className="text-xs text-[var(--gray-text)] text-center mb-3">{t('acceptedPayments') || 'Kabul Edilen Ödeme Yöntemleri'}</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-6 bg-white rounded flex items-center justify-center border border-[var(--gray-mid)]">
                        <span className="text-[10px] font-bold text-[#1A1F71]">VISA</span>
                      </div>
                      <div className="w-10 h-6 bg-white rounded flex items-center justify-center border border-[var(--gray-mid)]">
                        <span className="text-[10px] font-bold text-[#EB001B]">MC</span>
                      </div>
                      <div className="w-10 h-6 bg-white rounded flex items-center justify-center border border-[var(--gray-mid)]">
                        <span className="text-[10px] font-bold text-[#003087]">PP</span>
                      </div>
                      <div className="w-10 h-6 bg-white rounded flex items-center justify-center border border-[var(--gray-mid)]">
                        <span className="text-[10px] font-bold text-black">AMEX</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Box */}
                <div className="bg-white rounded-2xl border border-[var(--gray-mid)] p-5 mt-4">
                  <h3 className="font-bold text-[var(--navy)] text-sm mb-2">{t('needHelp') || 'Yardıma mı ihtiyacınız var?'}</h3>
                  <p className="text-xs text-[var(--gray-text)] mb-3">{t('helpText') || 'Sorularınız için 7/24 destek hattımızı arayabilirsiniz.'}</p>
                  <Link href="/support" className="text-[var(--gold)] text-sm font-semibold hover:opacity-70 transition-colors">
                    {t('contactSupport') || 'Destek ile İletişime Geç'} →
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
