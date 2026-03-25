"use client";

import React, { useState, useEffect } from "react";
import { Mail, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { authService } from "@/lib/services/authService";
import { ApiError } from "@/lib/api-client";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

function VerifyEmailForm() {
    const t = useTranslations('VerifyEmail');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) setEmail(emailParam);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 4) {
            setError(t('validCodeRequired'));
            return;
        }

        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            await authService.verifyEmail(email, code);
            setMessage(t('verifySuccess'));
            setTimeout(() => {
                router.push("/sign-in");
            }, 2000);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError(t('verifyError'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setError(t('emailRequiredResend'));
            return;
        }

        setIsResending(true);
        setError("");
        setMessage("");

        try {
            await authService.resendVerificationEmail(email);
            setMessage(t('resendSuccess'));
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError(t('resendError'));
            }
        } finally {
            setIsResending(false);
        }
    };

    return (
        <section className="pt-40 pb-20 px-4 min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,116,144,0.06)_0%,transparent_70%)]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
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
                    <h1 className="text-2xl font-bold text-foreground mt-6">{t('title')}</h1>
                    <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
                </div>

                <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium">
                                {message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('emailLabel')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-background/50 border-border/50 focus:border-primary"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">{t('codeLabel')}</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder={t('codePlaceholder')}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                                    className="pl-10 tracking-[0.5em] text-center text-lg font-bold bg-background/50 border-border/50 focus:border-primary placeholder:tracking-normal placeholder:font-normal"
                                    required
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
                                    {t('verifying')}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {t('verifyButton')}
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            )}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">{t('noCode')}</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleResend}
                            className="w-full bg-transparent border-border/50 hover:bg-secondary/50"
                            disabled={isResending}
                        >
                            {isResending ? (
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    {t('resending')}
                                </div>
                            ) : (
                                t('resendCode')
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        <Link href="/sign-in" className="text-primary hover:underline font-medium">
                            {t('backToSignIn')}
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}

export default function VerifyEmailPage() {
    return (
        <main className="min-h-screen bg-background">
            <Navbar />
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            }>
                <VerifyEmailForm />
            </Suspense>
            <Footer />
        </main>
    );
}
