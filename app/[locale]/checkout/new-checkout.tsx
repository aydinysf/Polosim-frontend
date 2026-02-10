"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { checkoutService, type CheckoutPreviewResponse } from "@/lib/services/checkoutService";
import { cartService } from "@/lib/services/cartService";
import { getSessionId } from "@/lib/utils/session";
import { GuestCheckoutForm } from "@/components/guest-checkout-form";
import { PaymentMethodSelector } from "@/components/payment-method-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Wallet, User, CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface GuestInfo {
  guest_email: string;
  guest_name: string;
  guest_surname: string;
}

export function NewCheckout() {
  const { isAuthenticated, user } = useAuth();
  const { items, clearCart, isLoaded } = useCart();
  const router = useRouter();
  
  const [checkoutData, setCheckoutData] = useState<CheckoutPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'stripe'>('stripe');
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    guest_email: "",
    guest_name: "",
    guest_surname: ""
  });
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleComplete = useCallback(() => {
    clearCart();
    setPaymentSuccess(true);
  }, [clearCart]);

  // Load checkout preview
  useEffect(() => {
    if (!isLoaded) return;

    if (items.length === 0) {
      setLoading(false);
      return;
    }

    const loadCheckoutPreview = async () => {
      try {
        setLoading(true);
        const sessionId = isAuthenticated ? undefined : getSessionId();

        // Sync cart with server
        try {
          await cartService.clearCart();
        } catch (e) {
          console.warn("Failed to clear remote cart:", e);
        }

        await Promise.all(items.map(item => cartService.addItem(item.id, item.quantity)));
        
        const previewData = await checkoutService.preview({
          items: items.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          })),
          session_id: sessionId
        });
        
        console.log("Checkout Preview Data:", previewData);
        setCheckoutData(previewData);
        
        // Auto-select wallet if user has sufficient balance
        const total = previewData.total || 0;
        if (isAuthenticated && user?.wallet_balance && user.wallet_balance >= total) {
          setSelectedMethod('wallet');
        }
        
      } catch (err) {
        console.error("Checkout preview error:", err);
        setError(err instanceof Error ? err.message : "Failed to load checkout");
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutPreview();
  }, [items, isAuthenticated, user, isLoaded]);

  const handleCheckout = async () => {
    try {
      setProcessing(true);
      
      const sessionId = isAuthenticated ? undefined : getSessionId();
      
      // Prepare execute data
      const executeData: any = {
        payment_method: selectedMethod,
        session_id: sessionId
      };

      if (!isAuthenticated) {
        executeData.guest_email = guestInfo.guest_email;
        executeData.guest_name = guestInfo.guest_name;
        executeData.guest_surname = guestInfo.guest_surname;
        
        // Comprehensive email fields to ensure backend/Stripe receives it
        executeData.email = guestInfo.guest_email;
        executeData.name = guestInfo.guest_name;
        executeData.surname = guestInfo.guest_surname;
        executeData.customer_email = guestInfo.guest_email;
        executeData.receipt_email = guestInfo.guest_email;
        
        // Simulate user object structure if backend expects it
        executeData.user = {
          email: guestInfo.guest_email,
          name: guestInfo.guest_name,
          surname: guestInfo.guest_surname
        };
      }

      console.log("Checkout Execute Data:", executeData);

      const result = await checkoutService.execute(executeData);
      
      if (result.client_secret && selectedMethod === 'stripe') {
        setClientSecret(result.client_secret);
      } else {
        // Wallet payment successful
        handleComplete();
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
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
    );
  }

  if (clientSecret) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setClientSecret(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Complete Payment</h1>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden p-4">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{
              clientSecret,
              onComplete: handleComplete,
            }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some eSIM plans to get started</p>
        <Link href="/plans">
          <Button>Browse Plans</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* User Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <User className="w-5 h-5" />
                Checkout as {user?.name}
              </>
            ) : (
              "Guest Checkout"
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Guest Information Form */}
      {!isAuthenticated && (
        <GuestCheckoutForm onGuestInfoChange={setGuestInfo} />
      )}

      {/* Payment Method Selection */}
      <PaymentMethodSelector
        isGuest={!isAuthenticated}
        selectedMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
        walletBalance={user?.wallet_balance}
      />

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {/* DEBUG: Temporary visualization of API response */}
          {/* <div className="mb-4 p-4 bg-muted rounded text-xs overflow-auto max-h-40">
            <p className="font-bold mb-1">Debug Info (Will be removed):</p>
            <pre>{JSON.stringify(checkoutData, null, 2)}</pre>
          </div> */}
          
          <div className="space-y-2">
            {(checkoutData.items || []).map((item) => (
              <div key={item.product_id} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>€{(item.line_amount || item.total || 0).toFixed(2)}</span>
              </div>
            ))}
            
            {(checkoutData.discount_amount || checkoutData.discount || 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-€{(checkoutData.discount_amount || checkoutData.discount || 0).toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>€{(checkoutData.total || checkoutData.subtotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Button */}
      <Button 
        onClick={handleCheckout} 
        disabled={processing || (!isAuthenticated && (!guestInfo.guest_email || !guestInfo.guest_name || !guestInfo.guest_surname))}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : selectedMethod === 'wallet' ? (
          <Wallet className="w-4 h-4 mr-2" />
        ) : (
          <CreditCard className="w-4 h-4 mr-2" />
        )}
        {processing ? "Processing..." : `Pay €${(checkoutData.total || checkoutData.subtotal || 0).toFixed(2)}`}
      </Button>
    </div>
  );
}