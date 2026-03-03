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
  onCheckoutSuccess: (data: { client_secret: string; order_id: number }) => void;
  onError?: (error: Error) => void;
}

type Step = 'email' | 'otp' | 'info' | 'ready';

export function GuestCheckoutForm({
  productId,
  quantity = 1,
  onCheckoutSuccess,
  onError,
}: GuestCheckoutFormProps) {
  // State yönetimi
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [token, setToken] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sayfa yenilendiğinde token'ı kontrol et
  useEffect(() => {
    const storedToken = localStorage.getItem('guest_token');
    if (storedToken) {
      setToken(storedToken);
      setStep('info'); // Token varsa doğrudan bilgi girişine geç
    }
  }, []);

  // Geri sayım sayacı
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email) || otpSent) {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setError('Lütfen geçerli bir e-posta adresi girin.');
      }
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.requestOtp(email);
      setStep('otp');
      setCountdown(60);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'OTP gönderilemedi. Lütfen tekrar deneyin.');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^[0-9]$/.test(value) && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^[0-9]{6}$/.test(pasteData)) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      handleVerifyOtp(pasteData);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.verifyOtp(email, code);
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('guest_token', newToken);
      setStep('info');
    } catch (err: any) {
      setError('Hatalı veya süresi dolmuş kod.');
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!firstName || !lastName) {
      setError('Lütfen adınızı ve soyadınızı girin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload: CheckoutPayload = {
        payment_method: 'stripe',
        product_id: productId,
        quantity,
        guest_name: firstName,
        guest_surname: lastName,
        guest_email: email,
      };
      const response = await authService.checkout(payload);
      onCheckoutSuccess(response.data);
      localStorage.removeItem('guest_token'); // Başarılı ödeme sonrası token'ı temizle
    } catch (err: any) {
      if (err instanceof ApiError) {
        console.error("Guest checkout error (API):", {
          endpoint: "/auth/checkout",
          statusCode: err.statusCode,
          message: err.message,
          details: err.details,
        });
      } else {
        console.error("Guest checkout error (Unknown):", err);
      }
      setError(err.message || 'Ödeme başlatılamadı.');
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
              onBlur={handleRequestOtp}
              disabled={step !== 'email' || loading}
            />
            {step === 'email' && (
              <Button onClick={handleRequestOtp} disabled={loading || !email}>
                {loading ? <Loader2 className="animate-spin" /> : 'Devam Et'}
              </Button>
            )}
            {step !== 'email' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="mr-2" />
                <span>Doğrulandı</span>
              </div>
            )}
          </div>
        </div>

        {/* Adım 2: OTP */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${step === 'otp' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="space-y-2 pt-4 border-t">
            <Label>Doğrulama Kodu</Label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={el => {
                    if (el) inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-10 h-12 text-center text-lg border-2 rounded-lg focus:border-primary"
                  disabled={loading}
                />
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {countdown > 0 ? (
                <p>{countdown} saniye içinde yeni kod isteyebilirsiniz.</p>
              ) : (
                <Button variant="link" size="sm" onClick={handleRequestOtp} disabled={loading}>
                  Tekrar Gönder
                </Button>
              )}
            </div>
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
