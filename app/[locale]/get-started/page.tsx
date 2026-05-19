"use client";

import React from "react"

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { useRouter, Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function GetStartedPage() {
  const t = useTranslations('GetStarted');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptMarketing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError(t('error.fillAll'));
        return;
      }
      setError("");
      setStep(2);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('error.match'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('error.length'));
      return;
    }

    if (!formData.acceptTerms) {
      setError(t('error.terms'));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      const email = formData.email.trim();

      const fullName = `${firstName} ${lastName}`;
      await register({
        name: fullName,
        email: email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('error.general'));
      }
    }
    finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="relative pt-32 pb-20 px-[5%] min-h-[calc(100vh-68px)] flex items-center justify-center overflow-hidden">
        {/* Background Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(201,168,76,0.05)_0%,transparent_70%)]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(13,27,42,0.03)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/logo.png"
                alt="POLO SIM"
                width={200}
                height={70}
                className="h-16 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-[28px] font-extrabold text-[var(--navy)] mt-8 tracking-tight">
              {t('title')}
            </h1>
            <p className="text-[var(--gray-text)] mt-2 font-medium">
              {t('subtitle')}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all ${
              step >= 1 ? "bg-[var(--gold)] text-white shadow-lg" : "bg-[var(--gray-bg)] text-[var(--gray-text)]"
            }`}>
              {step > 1 ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <div className={`w-20 h-1.5 rounded-full transition-all ${step > 1 ? "bg-[var(--gold)]" : "bg-[var(--gray-mid)]"}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all ${
              step >= 2 ? "bg-[var(--gold)] text-white shadow-lg" : "bg-[var(--gray-bg)] text-[var(--gray-text)]"
            }`}>
              2
            </div>
          </div>

          {/* Sign Up Form Card */}
          <div className="bg-white border-[1.5px] border-[var(--gray-mid)] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm font-semibold">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <>
                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--navy)] ml-1">{t('firstName')}</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gray-text)] group-focus-within:text-[var(--gold)] transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <Input
                          type="text"
                          name="firstName"
                          placeholder={t('firstNamePlaceholder')}
                          value={formData.firstName}
                          onChange={handleChange}
                          className="h-12 pl-12 bg-[var(--gray-bg)] border-[1.5px] border-transparent focus:border-[var(--gold)] focus:bg-white rounded-xl transition-all font-medium text-[var(--navy)] placeholder:text-[var(--gray-text)]/50"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[var(--navy)] ml-1">{t('lastName')}</label>
                      <Input
                        type="text"
                        name="lastName"
                        placeholder={t('lastNamePlaceholder')}
                        value={formData.lastName}
                        onChange={handleChange}
                        className="h-12 bg-[var(--gray-bg)] border-[1.5px] border-transparent focus:border-[var(--gold)] focus:bg-white rounded-xl transition-all font-medium text-[var(--navy)] placeholder:text-[var(--gray-text)]/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--navy)] ml-1">{t('email')}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gray-text)] group-focus-within:text-[var(--gold)] transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <Input
                        type="email"
                        name="email"
                        placeholder={t('emailPlaceholder')}
                        value={formData.email}
                        onChange={handleChange}
                        className="h-12 pl-12 bg-[var(--gray-bg)] border-[1.5px] border-transparent focus:border-[var(--gold)] focus:bg-white rounded-xl transition-all font-medium text-[var(--navy)] placeholder:text-[var(--gray-text)]/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Continue Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white h-14 rounded-2xl font-extrabold text-base transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {t('continue')}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <>
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--navy)] ml-1">{t('password')}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gray-text)] group-focus-within:text-[var(--gold)] transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={t('passwordPlaceholder')}
                        value={formData.password}
                        onChange={handleChange}
                        className="h-12 pl-12 pr-12 bg-[var(--gray-bg)] border-[1.5px] border-transparent focus:border-[var(--gold)] focus:bg-white rounded-xl transition-all font-medium text-[var(--navy)] placeholder:text-[var(--gray-text)]/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--gray-text)] hover:text-[var(--navy)] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-2 pt-1">
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                i < passwordStrength() ? strengthColors[passwordStrength() - 1] : "bg-[var(--gray-mid)]"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs font-medium text-[var(--gray-text)]">
                          {t('passwordStrength')} {t(`strength.${["weak", "fair", "good", "strong"][passwordStrength() - 1] || "weak"}`)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--navy)] ml-1">{t('confirmPassword')}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gray-text)] group-focus-within:text-[var(--gold)] transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder={t('confirmPasswordPlaceholder')}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="h-12 pl-12 bg-[var(--gray-bg)] border-[1.5px] border-transparent focus:border-[var(--gold)] focus:bg-white rounded-xl transition-all font-medium text-[var(--navy)] placeholder:text-[var(--gray-text)]/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className="w-5 h-5 mt-0.5 rounded border-[var(--gray-mid)] bg-[var(--gray-bg)] text-[var(--gold)] focus:ring-[var(--gold)] cursor-pointer"
                      />
                      <span className="text-sm text-[var(--gray-text)] leading-relaxed">
                        <Link href="/terms" className="text-[var(--gold)] hover:underline font-semibold">{t('termsAgreement')}</Link>
                        {t('and')}
                        <Link href="/privacy" className="text-[var(--gold)] hover:underline font-semibold">{t('privacyAgreement')}</Link>
                        {t('agreeToPost') || ""}
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="acceptMarketing"
                        checked={formData.acceptMarketing}
                        onChange={handleChange}
                        className="w-5 h-5 mt-0.5 rounded border-[var(--gray-mid)] bg-[var(--gray-bg)] text-[var(--gold)] focus:ring-[var(--gold)] cursor-pointer"
                      />
                      <span className="text-sm text-[var(--gray-text)] leading-relaxed">
                        {t('marketingConsent')}
                      </span>
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-xl border-[1.5px] border-[var(--gray-mid)] bg-white text-[var(--navy)] font-bold hover:bg-[var(--gray-bg)] hover:border-[var(--gold)] transition-all"
                    >
                      {t('back')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 rounded-xl bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white font-bold transition-all shadow-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t('creating')}
                        </div>
                      ) : (
                        t('createAccount')
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            {step === 1 && (
              <>
                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--gray-mid)]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-[var(--gray-text)] font-semibold">{t('orContinueWith')}</span>
                  </div>
                </div>

                {/* Social Sign Up */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-12 rounded-xl border-[1.5px] border-[var(--gray-mid)] bg-white text-[var(--navy)] font-semibold hover:bg-[var(--gray-bg)] hover:border-[var(--gold)] transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 rounded-xl border-[1.5px] border-[var(--gray-mid)] bg-white text-[var(--navy)] font-semibold hover:bg-[var(--gray-bg)] hover:border-[var(--gold)] transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                    </svg>
                    Apple
                  </Button>
                </div>
              </>
            )}

            {/* Sign In Link */}
            <div className="mt-8 pt-6 border-t border-[var(--gray-mid)] text-center">
              <p className="text-sm text-[var(--gray-text)] font-medium">
                {t('alreadyHaveAccount') || 'Zaten hesabınız var mı?'}{" "}
                <Link href="/sign-in" className="text-[var(--gold)] hover:underline font-bold">
                  {t('signIn')}
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mb-2">
                <Smartphone className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <p className="text-xs font-semibold text-[var(--gray-text)] max-w-[90px] leading-tight">{t('benefits.instantActivation')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mb-2">
                <Check className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <p className="text-xs font-semibold text-[var(--gray-text)] max-w-[90px] leading-tight">{t('benefits.noHiddenFees')}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center mb-2">
                <Lock className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <p className="text-xs font-semibold text-[var(--gray-text)] max-w-[90px] leading-tight">{t('benefits.securePayment')}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
