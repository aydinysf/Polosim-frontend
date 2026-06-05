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
import { SearchHeader } from "@/components/search-header";

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
                        <Button className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white border-none rounded-3xl px-8 h-12 font-bold transition-all shadow-lg">Back to Home</Button>
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
            <SearchHeader 
                title={isLoading ? "Loading..." : error ? "404" : pageData?.title || ""}
                subtitle={
                    !isLoading && pageData?.updated_at
                        ? `Last updated: ${new Date(pageData.updated_at).toLocaleDateString(locale)}`
                        : undefined
                }
                badge={isLoading ? "Page" : error ? "Not Found" : "Page"}
            />

            {/* Content Section */}
            <div className="bg-[#F5F7FA] py-12 px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[var(--gray-mid)] shadow-sm p-6 md:p-12">
                    {renderContent()}

                    {!isLoading && (
                        <div className="mt-12 pt-6 border-t border-[var(--gray-mid)] text-center">
                            <Link href="/">
                                <Button variant="ghost" className="gap-2 text-[var(--gold)] hover:text-[var(--gold-light)] font-bold hover:bg-transparent">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
