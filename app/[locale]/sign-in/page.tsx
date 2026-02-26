"use client";

import React, { useState, useRef, ChangeEvent, KeyboardEvent, ClipboardEvent, useEffect } from "react";
import { Mail, ArrowRight, Smartphone, Lock, CheckCircle } from "lucide-react";
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

type Step = "email" | "otp";

export default function SignInPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login, setAuthData } = useAuth();
  const router = useRouter();

  // Geri sayım
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Adım 1: E-posta gönder, OTP iste
  const handleRequestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await authService.requestOtp(email);
      setStep("otp");
      setOtp(Array(6).fill(""));
      setCountdown(60);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Kod gönderilemedi. Lütfen tekrar deneyin.");
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP kutu değişimi
  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^[0-9]$/.test(value) && value !== "") return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every((d) => d !== "")) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (/^[0-9]{6}$/.test(paste)) {
      setOtp(paste.split(""));
      handleVerifyOtp(paste);
    }
  };

  // Adım 2: OTP doğrula ve giriş yap
  const handleVerifyOtp = async (code: string) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await authService.verifyOtp(email, code);
      const { token, user } = (response as any).data;
      if (token && user) {
        setAuthData(user, token); // auth-context'i güncelle (locale-aware)
        router.push("/profile");
      }
    } catch (err) {
      setError("Hatalı veya süresi dolmuş kod. Lütfen tekrar deneyin.");
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-40 pb-20 px-4 min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,116,144,0.06)_0%,transparent_70%)]" />
          <div className="absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="POLO SIM"
                width={180}
                height={60}
                className="h-16 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-2xl font-bold text-foreground mt-6">
              {step === "email" ? "Welcome Back" : "Check Your Email"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {step === "email"
                ? "Sign in with your email – no password needed"
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 space-y-6">

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* ADIM 1: E-posta */}
            {step === "email" && (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending Code...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Send Login Code
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
            )}

            {/* ADIM 2: OTP */}
            {step === "otp" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Code sent! Check your inbox (and spam folder).</span>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground block text-center">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex justify-center gap-2" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { if (el) inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-11 h-13 text-center text-xl font-bold border-2 rounded-lg focus:border-primary bg-background/50"
                        disabled={isLoading}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    Verifying...
                  </div>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  {countdown > 0 ? (
                    <p>Resend code in {countdown}s</p>
                  ) : (
                    <button
                      onClick={() => handleRequestOtp()}
                      disabled={isLoading}
                      className="text-primary hover:underline font-medium disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  onClick={() => { setStep("email"); setError(""); setOtp(Array(6).fill("")); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground text-center"
                >
                  ← Use a different email
                </button>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>No Password Needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>200+ Countries</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            New here?{" "}
            <Link href="/get-started" className="text-primary hover:underline font-medium">
              Get Started
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
