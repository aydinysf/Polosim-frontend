"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { checkoutService, type CheckoutExecutePayload } from "@/lib/services/checkoutService";
import { GuestCheckoutForm } from "@/components/guest-checkout-form";
import { PaymentMethodSelector } from "@/components/payment-method-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Wallet, User, CheckCircle, ArrowLeft, ShoppingBag, Send } from "lucide-react";
import { StripeProvider } from "@/components/stripe-provider";
import { StripePaymentForm } from "@/components/stripe-payment-form";
import { WalletPaymentButton } from "@/components/wallet-payment-button";
import { PendingPaymentBanner } from "@/components/pending-payment-banner";
import { PayPalPayment } from "@/components/paypal-payment";
import { useWalletPayment } from "@/hooks/use-wallet-payment";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ApiError, getCartSessionId } from "@/lib/api-client";
import { PENDING_INTENT_KEY } from "@/lib/types/payment";

import { useLocale, useTranslations } from "next-intl";

// Bileşenin genel durumlarını yönetmek için bir enum
enum PageState {
  LOADING,
  EMPTY_CART,
  CHECKOUT_READY,
  STRIPE_PAYMENT,
  WALLET_PAYMENT,
  PAYPAL_PAYMENT,
  PAYMENT_SUCCESS,
  ERROR,
}

export function NewCheckout() {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const { isAuthenticated, user } = useAuth();
  const { items, clearCart, isLoaded, totalPrice } = useCart();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'stripe' | 'paypal'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Wallet payment hook for Apple Pay / Google Pay
  const totalAmountCents = totalPrice;

  const walletPayment = useWalletPayment(totalAmountCents, 'eur', orderId ?? undefined);

  // Ödeme başarılı olduğunda çalışacak fonksiyon
  const handlePaymentSuccess = useCallback(() => {
    clearCart();
    localStorage.removeItem(PENDING_INTENT_KEY);
    setPageState(PageState.PAYMENT_SUCCESS);
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

    if (selectedMethod === 'paypal') {
      // Proceed to execute instead of setting PageState.PAYPAL_PAYMENT
    }

    setPageState(PageState.LOADING);
    try {
      const firstItem = items[0];
      const sessionId = getCartSessionId();

      const payload: CheckoutExecutePayload = {
        payment_method: selectedMethod,
        session_id: sessionId,
        product_id: firstItem.id,
        quantity: firstItem.quantity,
        guest_email: user?.email || undefined
      };

      const result = await checkoutService.execute(payload);

      setOrderId(result.order_id);

      // PayPal veya Stripe Redirect Kontrolü
      const redirectUrl = result.redirect_url || result.url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }


      if (selectedMethod === 'stripe' && result.client_secret) {
        setClientSecret(result.client_secret);
        setPageState(PageState.STRIPE_PAYMENT);
      } else if (selectedMethod === 'paypal') {
        // Switch to PayPal button view (Eğer direkt redirect olmadıysa)
        setPageState(PageState.PAYPAL_PAYMENT);
      } else {
        handlePaymentSuccess();
      }
    } catch (err: any) {
      console.error("❌ Checkout ERROR:", err);

      let errorMsg = "Sipariş oluşturulurken bir hata oluştu.";
      let technicalDetail = "";

      if (err instanceof ApiError) {
        errorMsg = err.message || errorMsg;
        technicalDetail = err.details ? JSON.stringify(err.details) : "";
      } else if (err.response?.data) {
        errorMsg = err.response.data.message || errorMsg;
        technicalDetail = err.response.data.error_detail || "";
      }

      setErrorMessage(errorMsg + (technicalDetail ? ` [${technicalDetail}]` : ""));
      setPageState(PageState.ERROR);
      toast.error(errorMsg);
    }
  };

  // Initiate wallet payment (Apple Pay / Google Pay)
  const handleWalletCheckout = async () => {
    await walletPayment.initiate();
  };

  // Once walletPayment has a clientSecret, transition to wallet payment view
  useEffect(() => {
    if (walletPayment.clientSecret && walletPayment.status === 'processing') {
      setClientSecret(walletPayment.clientSecret);
      setPageState(PageState.WALLET_PAYMENT);
    }
    if (walletPayment.error) {
      setErrorMessage(walletPayment.error.message);
      setPageState(PageState.ERROR);
      toast.error(walletPayment.error.message);
    }
  }, [walletPayment.clientSecret, walletPayment.status, walletPayment.error]);

  // --- RENDER FONKSİYONLARI ---

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-[var(--gold)]" />
      <p className="text-[var(--gray-text)] font-bold uppercase tracking-widest text-[10px]">İşlem Yapılıyor...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-100 px-6">
      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-6 shadow-sm">
        <X className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-[var(--text-dark)] mb-2 font-['Sora']">Bir Hata Oluştu</h2>
      <p className="text-red-500/80 font-medium max-w-md mx-auto">{errorMessage}</p>
      <Button onClick={() => router.push('/cart')} className="mt-8 bg-[var(--navy)] text-white hover:bg-[var(--text-dark)] rounded-2xl px-8 h-12 font-bold">
        {t('backToCart')}
      </Button>
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
    <div className="max-w-2xl mx-auto text-center py-16 bg-[var(--gray-bg)] rounded-[32px] border-[1.5px] border-[var(--gray-mid)] px-8 shadow-sm">
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto mb-8 shadow-lg">
        <CheckCircle className="w-12 h-12 text-emerald-500" />
      </div>
      <h1 className="text-[32px] font-extrabold text-[var(--text-dark)] mb-4 font-['Sora'] tracking-tight">{t('success.title')}</h1>
      <p className="text-[var(--gray-text)] text-lg font-medium mb-10 max-w-md mx-auto leading-relaxed">
        {t('success.description')}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/" className="no-underline">
          <Button className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white h-14 px-10 rounded-2xl font-extrabold shadow-lg transition-all">{t('success.backToHome')}</Button>
        </Link>
        <Link href="/support" className="no-underline">
          <Button variant="outline" className="border-[var(--text-dark)] text-[var(--text-dark)] hover:bg-[var(--text-dark)] hover:text-white h-14 px-10 rounded-2xl font-bold transition-all">{t('success.needHelp')}</Button>
        </Link>
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
      {clientSecret ? (
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden p-6">
          <StripeProvider clientSecret={clientSecret}>
            <StripePaymentForm
              onSuccess={handlePaymentSuccess}
              amount={totalAmountCents}
              clientSecret={clientSecret}
            />
          </StripeProvider>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-32">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}
    </div>
  );

  const renderWalletPayment = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setPageState(PageState.CHECKOUT_READY)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>
      {clientSecret ? (
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden p-6">
          <StripeProvider clientSecret={clientSecret}>
            <WalletPaymentButton
              amount={totalAmountCents}
              currency="eur"
              orderId={orderId ?? undefined}
              onSuccess={(oid) => {
                setOrderId(oid);
                handlePaymentSuccess();
              }}
              onError={(err) => {
                setErrorMessage(err.message);
                toast.error(err.message);
              }}
            />
          </StripeProvider>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-32">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}
    </div>
  );

  const renderPaypalPayment = () => {
    const totalAmount = (totalPrice / 100).toFixed(2);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setPageState(PageState.CHECKOUT_READY)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <Card className="rounded-2xl p-6">
          <PayPalPayment
            amount={totalAmount}
            currency="EUR"
            onSuccess={(details) => {
              console.log("PayPal Success:", details);
              handlePaymentSuccess();
            }}
            onError={(err) => {
              setErrorMessage(err);
              setPageState(PageState.ERROR);
            }}
          />
        </Card>
      </div>
    );
  };

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
          paymentMethod={selectedMethod === 'paypal' ? 'paypal' : 'stripe'}
          onCheckoutSuccess={(data) => {
            setOrderId(data.order_id);
            if (selectedMethod === 'stripe') {
              setClientSecret(data.client_secret);
              setPageState(PageState.STRIPE_PAYMENT);
            }
            else if (selectedMethod === 'paypal') {
              setPageState(PageState.PAYPAL_PAYMENT);
            }
          }}
          onError={(err) => {
            setErrorMessage(err.message || t('error.guestError'));
            setPageState(PageState.ERROR);
          }}
        />
      )}

      <PaymentMethodSelector
        isGuest={!isAuthenticated}
        selectedMethod={selectedMethod}
        onMethodChange={(method) => {
          setSelectedMethod(method as any);
        }}
        walletBalance={user?.wallet_balance}
      />

      {/* Giriş yapmış kullanıcı ise, özetini göster */}
      {isAuthenticated && (
        <div className="space-y-6">
          <div className="bg-white border-[1.5px] border-[var(--gray-mid)] rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--text-dark)] mb-5 font-['Sora']">{t('ready.orderSummary')}</h3>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-[var(--gray-text)] font-bold">{item.name} <span className="text-[var(--gold)] ml-1">× {item.quantity}</span></span>
                  <span className="text-[var(--text-dark)] font-extrabold text-lg">€{((item.priceInCents || (item.price ? item.price * 100 : 0)) * item.quantity / 100).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-[var(--gray-mid)] pt-5 mt-5">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-dark)] font-extrabold text-xl font-['Sora']">{t('ready.total')}</span>
                  <span className="text-[var(--gold)] font-extrabold text-3xl">€{(totalPrice / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleAuthenticatedCheckout} 
            disabled={pageState === PageState.LOADING} 
            className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white h-16 rounded-3xl font-extrabold text-xl transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-3"
          >
            {pageState === PageState.LOADING ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              selectedMethod === 'wallet' ? <Wallet className="w-6 h-6" /> :
                selectedMethod === 'paypal' ? <Send className="w-6 h-6" /> :
                  <CreditCard className="w-6 h-6" />
            )}
            {pageState === PageState.LOADING ? t('ready.processing') : t('ready.pay', { amount: `€${(totalPrice / 100).toFixed(2)}` })}
          </Button>
          
          <p className="text-[11px] text-[var(--gray-text)] text-center font-bold uppercase tracking-widest">
            {tc('secureCheckout') || 'Güvenli Ödeme • 256-bit SSL'}
          </p>
        </div>
      )}
    </div>
  );

  // Ana render mantığı
  return (
    <>
      {/* Pending payment recovery banner — shown on all states */}
      <PendingPaymentBanner />

      {/* Main content */}
      {(() => {
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
          case PageState.WALLET_PAYMENT:
            return renderWalletPayment();
          case PageState.PAYPAL_PAYMENT:
            return renderPaypalPayment();
          case PageState.CHECKOUT_READY:
            return renderCheckoutReady();
          default:
            return renderLoading();
        }
      })()}
    </>
  );
}
