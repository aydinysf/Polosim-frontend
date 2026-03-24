"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { checkoutService } from "@/lib/services/checkoutService";
import { GuestCheckoutForm } from "@/components/guest-checkout-form";
import { PaymentMethodSelector } from "@/components/payment-method-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Wallet, User, CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripePaymentForm } from "@/components/stripe-payment-form";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ApiError } from "@/lib/api-client";

import { useLocale, useTranslations } from "next-intl";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const hasStripeKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Bileşenin genel durumlarını yönetmek için bir enum
enum PageState {
  LOADING,
  EMPTY_CART,
  CHECKOUT_READY,
  STRIPE_PAYMENT,
  PAYMENT_SUCCESS,
  ERROR,
}

export function NewCheckout() {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const { isAuthenticated, user } = useAuth();
  const { items, clearCart, isLoaded } = useCart();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'stripe'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Ödeme başarılı olduğunda çalışacak fonksiyon
  const handlePaymentSuccess = useCallback(() => {
    clearCart();
    setPageState(PageState.PAYMENT_SUCCESS);
    // Burada e-posta gönderme gibi işlemler yapılabilir.
  }, [clearCart]);

  // Sadece cart kontrolü yap
  useEffect(() => {
    if (!isLoaded) return;

    if (items.length === 0) {
      setPageState(PageState.EMPTY_CART);
    } else {
      setPageState(PageState.CHECKOUT_READY);
    }
  }, [items, isLoaded]);

  // Sadece GİRİŞ YAPMIŞ kullanıcılar için ödeme işlemini başlatan fonksiyon
  const handleAuthenticatedCheckout = async () => {
    if (!isAuthenticated || items.length === 0) return;

    // Defensive: verify token is still present in localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setErrorMessage(t('error.sessionExpired'));
      setPageState(PageState.ERROR);
      return;
    }

    setPageState(PageState.LOADING);
    try {
      // İlk ürünü kullan (çoklu ürün desteği için genişletilebilir)
      const firstItem = items[0];
      const payload = {
        payment_method: selectedMethod,
        product_id: firstItem.id,
        quantity: firstItem.quantity
      };
      const result = await checkoutService.execute(payload);

      setOrderId(result.order_id);

      if (selectedMethod === 'stripe' && result.client_secret) {
        setClientSecret(result.client_secret);
        setPageState(PageState.STRIPE_PAYMENT);
      } else {
        handlePaymentSuccess();
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        console.error("Checkout execution error (API):", {
          endpoint: "/checkout/execute",
          statusCode: err.statusCode,
          message: err.message,
          details: err.details,
        });
      } else {
        console.error("Checkout execution error (Unknown):", err);
      }
      setErrorMessage(err.message || t('error.general'));
      setPageState(PageState.ERROR);
    }
  };

  // --- RENDER FONKSİYONLARI ---

  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-64">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  const renderError = () => (
    <div className="text-center text-destructive">
      <p>{errorMessage}</p>
      <Button onClick={() => router.push('/cart')} className="mt-4">{t('backToCart')}</Button>
    </div>
  );

  const renderEmptyCart = () => (
    <div className="text-center py-12">
      <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">{t('emptyCart')}</h2>
      <p className="text-muted-foreground mb-6">{t('addPlans')}</p>
      <Link href="/plans">
        <Button>{t('browsePlans')}</Button>
      </Link>
    </div>
  );

  const renderPaymentSuccess = () => (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-emerald-500" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-4">{t('success.title')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('success.description')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/"><Button>{t('success.backToHome')}</Button></Link>
        <Link href="/support"><Button variant="outline">{t('success.needHelp')}</Button></Link>
      </div>
    </div>
  );

  const renderStripePayment = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setPageState(PageState.CHECKOUT_READY)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>
      {!hasStripeKey ? (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {t('error.stripeKeyMissing')}
        </div>
      ) : clientSecret ? (
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden p-6">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#c9a84c',
                  borderRadius: '8px',
                },
              },
            }}
          >
            <StripePaymentForm onSuccess={handlePaymentSuccess} />
          </Elements>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-32">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}
    </div>
  );

  const renderCheckoutReady = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isAuthenticated ? t('ready.continueAs', { name: user?.name || '' }) : t('ready.continueAsGuest')}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Misafir kullanıcı ise, kendi kendini yöneten formu göster */}
      {!isAuthenticated && items.length > 0 && (
        <GuestCheckoutForm
          productId={items[0].id}
          quantity={items[0].quantity}
          onCheckoutSuccess={(data) => {
            setClientSecret(data.client_secret);
            setOrderId(data.order_id);
            setPageState(PageState.STRIPE_PAYMENT);
          }}
          onError={(err) => {
            setErrorMessage(err.message || t('error.guestError'));
            setPageState(PageState.ERROR);
          }}
        />
      )}

      {/* Giriş yapmış kullanıcı ise, ödeme yöntemini ve özetini göster */}
      {isAuthenticated && (
        <>
          <PaymentMethodSelector
            isGuest={false}
            selectedMethod={selectedMethod}
            onMethodChange={setSelectedMethod}
            walletBalance={user?.wallet_balance}
          />
          <Card>
            <CardHeader><CardTitle>{t('ready.orderSummary')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>€{((item.priceInCents / 100) * item.quantity || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>{t('ready.total')}</span>
                    <span>€{(items.reduce((sum, item) => sum + ((item.priceInCents / 100) * item.quantity), 0) || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleAuthenticatedCheckout} disabled={pageState === PageState.LOADING} className="w-full" size="lg">
            {pageState === PageState.LOADING ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (selectedMethod === 'wallet' ? <Wallet className="w-4 h-4 mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />)}
            {pageState === PageState.LOADING ? t('ready.processing') : t('ready.pay', { amount: `€${(items.reduce((sum, item) => sum + ((item.priceInCents / 100) * item.quantity), 0) || 0).toFixed(2)}` })}
          </Button>
        </>
      )}
    </div>
  );

  // Ana render mantığı
  switch (pageState) {
    case PageState.LOADING:
      return renderLoading();
    case PageState.ERROR:
      return renderError();
    case PageState.EMPTY_CART:
      return renderEmptyCart();
    case PageState.PAYMENT_SUCCESS:
      return renderPaymentSuccess();
    case PageState.STRIPE_PAYMENT:
      return renderStripePayment();
    case PageState.CHECKOUT_READY:
      return renderCheckoutReady();
    default:
      return renderLoading();
  }
}
