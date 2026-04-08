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
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuthData } = useAuth();
  const router = useRouter();

  // Tek Adımda Giriş (Passwordless)
  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // Backend artık direkt token dönüyor
      const response = await authService.login({ identifier: email });
      if (response.token && response.user) {
        setAuthData(response.user, response.token);
        router.push("/profile");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Giriş yapılamadı. Lütfen tekrar deneyin.");
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
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
              Welcome to POLO SIM
            </h1>
            <p className="text-muted-foreground mt-2">
              Sign in or create an account with your email – no password needed
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

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
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
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Login / Sign Up
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
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
