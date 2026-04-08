"use client";

import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { authService, CheckoutPayload } from '@/lib/services/authService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ApiError } from '@/lib/api-client';

// Props arayüzü
interface GuestCheckoutFormProps {
  productId: number;
  quantity?: number;
  paymentMethod?: 'stripe' | 'paypal';
  onCheckoutSuccess: (data: any) => void;
  onError?: (error: Error) => void;
}

type Step = 'email' | 'info' | 'ready';

export function GuestCheckoutForm({
  productId,
  quantity = 1,
  paymentMethod = 'stripe',
  onCheckoutSuccess,
  onError,
}: GuestCheckoutFormProps) {
  // State yönetimi
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sayfa yenilendiğinde token'ı kontrol et
  useEffect(() => {
    const storedToken = localStorage.getItem('guest_token');
    if (storedToken) {
      setToken(storedToken);
      setStep('info'); // Token varsa doğrudan bilgi girişine geç
    }
  }, []);

  const handleEmailSubmitted = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    setError('');
    setStep('info');
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const payload: CheckoutPayload = {
        payment_method: paymentMethod, // 🔥 ARTIK DIREKT KULLANABİLİRİZ
        product_id: productId,
        quantity,
        guest_name: firstName || undefined,
        guest_surname: lastName || undefined,
        guest_email: email,
      };
      const response = await authService.checkout(payload);
      
      // PayPal redirect handling
      if (paymentMethod === 'paypal' && (response.data.redirect_url || response.data.url)) {
        window.location.href = response.data.redirect_url || response.data.url;
        return;
      }

      onCheckoutSuccess(response.data);
      localStorage.removeItem('guest_token'); // Başarılı ödeme sonrası token'ı temizle
    } catch (err: any) {
      let errorMessage = err.message || 'Ödeme başlatılamadı.';
      
      // Use details if it's an ApiError from Laravel 422 Unprocessable Entity
      if (err instanceof ApiError && err.details) {
        errorMessage = typeof err.details === 'object' 
          ? Object.values(err.details).flat().join(', ') 
          : typeof err.details === 'string' ? err.details : errorMessage;
      }

      setError(errorMessage);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Misafir Olarak Devam Et</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Adım 1: E-posta */}
        <div className="space-y-2">
          <Label htmlFor="email">E-posta Adresi</Label>
          <div className="flex items-center gap-2">
            <Input
              id="email"
              type="email"
              placeholder="kullanici@ornek.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step !== 'email' || loading}
            />
            {step === 'email' && (
              <Button onClick={handleEmailSubmitted} disabled={loading || !email}>
                Devam Et
              </Button>
            )}
            {(step === 'info' || step === 'ready') && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2" />
                <span>Doğrulandı</span>
              </div>
            )}
          </div>
        </div>


        {/* Adım 3: Ad/Soyad */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${step === 'info' || step === 'ready' ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Adım 4: Ödeme Butonu */}
        {(step === 'info' || step === 'ready') && (
          <Button onClick={handleCheckout} disabled={loading || !firstName || !lastName} className="w-full">
            {loading ? <Loader2 className="animate-spin" /> : 'Ödemeye Geç'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
