"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, Smartphone, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { authService } from "@/lib/services/authService";
import { ApiError } from "@/lib/api-client";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuthData } = useAuth();
  const router = useRouter();
  const t = useTranslations('Auth');

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError(t('invalidEmail'));
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await authService.login({ identifier: email });
      if (response.token && response.user) {
        setAuthData(response.user, response.token);
        router.push("/profile");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || t('loginError'));
      } else {
        setError(t('generalError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="relative pt-24 pb-20 px-[5%] min-h-[calc(100vh-68px)] flex items-center justify-center overflow-hidden">
        {/* Background Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(201,168,76,0.05)_0%,transparent_70%)]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(13,27,42,0.03)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/logo.png"
                alt="POLO SIM"
                width={200}
                height={70}
                className="h-16 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-[28px] font-extrabold text-[var(--text-dark)] mt-8 font-['Sora'] tracking-tight">
              {t('welcomeTitle') || 'POLO SIM\'e Hoş Geldiniz'}
            </h1>
            <p className="text-[var(--gray-text)] mt-2 font-medium">
              {t('loginSubtitle') || 'Şifre gerektirmeden sadece e-posta adresinizle giriş yapın.'}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-[1.5px] border-[var(--gray-mid)] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-dark)] ml-1">{t('emailLabel') || 'E-posta Adresiniz'}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gray-text)] group-focus-within:text-[var(--gold)] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-[var(--gray-bg)] border-[1.5px] border-transparent focus:border-[var(--gold)] focus:bg-white rounded-2xl transition-all font-medium text-[var(--text-dark)] placeholder:text-[var(--gray-text)]/50"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white h-14 rounded-2xl font-extrabold text-base transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('loading') || 'Giriş yapılıyor...'}
                  </>
                ) : (
                  <>
                    {t('loginBtn') || 'Giriş Yap / Kayıt Ol'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--gray-mid)] text-center">
              <p className="text-sm text-[var(--gray-text)] font-medium">
                {t('noAccount') || 'Hesabınız yok mu?'} {" "}
                <Link href="/get-started" className="text-[var(--gold)] hover:underline font-bold">
                  {t('getStarted') || 'Hemen Başlayın'}
                </Link>
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[var(--gray-text)] uppercase tracking-wider bg-[var(--gray-bg)] py-2 rounded-lg">
                 <Lock className="w-3.5 h-3.5 text-[var(--gold)]" />
                 <span>{t('trust.noPassword')}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[var(--gray-text)] uppercase tracking-wider bg-[var(--gray-bg)] py-2 rounded-lg">
                 <Smartphone className="w-3.5 h-3.5 text-[var(--gold)]" />
                 <span>{t('trust.instant')}</span>
              </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
