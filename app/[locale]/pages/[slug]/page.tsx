"use client";

import { ArrowLeft, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { pageService, type Page } from "@/lib/services/pageService";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

export default function DynamicCMSPage() {
    const params = useParams();
    const slug = params.slug as string;
    const locale = useLocale();
    const t = useTranslations('Common');
    
    const [pageData, setPageData] = useState<Page | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        
        setIsLoading(true);
        setError(null);
        
        pageService.getPage(slug, locale)
            .then(data => {
                if (data) {
                    setPageData(data);
                } else {
                    setError("Page not found");
                }
            })
            .catch(err => {
                console.error('CMS Page fetch failed:', err.message);
                setError(err.message || "An error occurred");
            })
            .finally(() => setIsLoading(false));
    }, [slug, locale]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            );
        }

        if (error || !pageData) {
            return (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold mb-4">404 - {t('pageNotFound') || 'Page Not Found'}</h2>
                    <p className="text-muted-foreground mb-8">
                        {error === "Page not found" ? "The page you are looking for does not exist." : error}
                    </p>
                    <Link href="/">
                        <Button>Back to Home</Button>
                    </Link>
                </div>
            );
        }

        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div 
                    className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed
                               prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground"
                    dangerouslySetInnerHTML={{ __html: pageData.content }}
                />
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-40 pb-12 px-4 relative overflow-hidden bg-gray-100 dark:bg-zinc-950">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                
                <div className="relative max-w-4xl mx-auto text-center">
                    {!isLoading && pageData && (
                        <>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-6">
                                <Shield className="w-4 h-4 text-primary" />
                                <span className="text-sm text-muted-foreground">{pageData.title}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                                {pageData.title}
                            </h1>
                            {pageData.updated_at && (
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>Last updated: {new Date(pageData.updated_at).toLocaleDateString(locale)}</span>
                                </div>
                            )}
                        </>
                    )}
                    {isLoading && (
                        <div className="flex flex-col items-center">
                            <Skeleton className="h-8 w-32 rounded-full mb-6" />
                            <Skeleton className="h-12 w-64 mb-4" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    )}
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    {renderContent()}

                    {!isLoading && (
                        <div className="mt-16 pt-8 border-t border-border/50">
                            <Link href="/">
                                <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
