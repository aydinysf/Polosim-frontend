"use client";

import { Download, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { pageService, type Page } from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";

const content = {
    en: {
        title: "Terms of Service",
        lastUpdated: "Last updated: March 2025",
        downloadLabel: "Download PDF / DOCX",
        downloadHref: "/policy/en/POLO_SIM_Terms_of_Service_EN.docx",
        backLabel: "Back to Home",
        sections: [
            {
                heading: "1. Acceptance of Terms",
                text: "By accessing or using the POLO SIM website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
            },
            {
                heading: "2. Services Description",
                text: "POLO SIM provides digital eSIM products that allow users to access mobile data in supported countries. Our services are limited to data connectivity and do not include traditional voice calls or SMS unless explicitly stated.",
            },
            {
                heading: "3. Account Registration",
                text: "To purchase an eSIM, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
            },
            {
                heading: "4. Orders and Payment",
                text: "All orders are subject to availability and acceptance. Prices are displayed in your selected currency and may be subject to applicable taxes. We accept major credit cards and other payment methods displayed at checkout.",
            },
            {
                heading: "5. eSIM Delivery and Activation",
                text: "After a successful purchase, your eSIM QR code will be delivered to your registered email address. You are responsible for ensuring your device is eSIM-compatible and unlocked before purchase.",
            },
            {
                heading: "6. Acceptable Use",
                text: "You agree not to use our services for any unlawful purpose, to resell eSIMs without authorization, or to engage in any activity that disrupts or interferes with our network or services.",
            },
            {
                heading: "7. Limitation of Liability",
                text: "POLO SIM shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our services, including service interruptions caused by network operators.",
            },
            {
                heading: "8. Modifications to Service",
                text: "We reserve the right to modify, suspend, or discontinue any part of our services at any time. We will provide reasonable notice where possible.",
            },
            {
                heading: "9. Governing Law",
                text: "These Terms are governed by the laws of the Republic of Turkey. Any disputes shall be resolved through the courts of Istanbul.",
            },
            {
                heading: "10. Contact",
                text: "For questions regarding these Terms, contact us at support@polosim.com.",
            },
        ],
    },
    tr: {
        title: "Kullanım Koşulları",
        lastUpdated: "Son güncelleme: Mart 2025",
        downloadLabel: "PDF / DOCX İndir",
        downloadHref: "/policy/tr/POLO_SIM_Kullanim_Kosullari_TR.docx",
        backLabel: "Ana Sayfaya Dön",
        sections: [
            {
                heading: "1. Koşulların Kabulu",
                text: "POLO SIM web sitesine ve hizmetlerine erişerek veya bunları kullanarak bu Kullanım Koşulları'na bağlı olmayı kabul etmiş olursunuz. Bu koşulları kabul etmiyorsanız lütfen hizmetlerimizi kullanmayınız.",
            },
            {
                heading: "2. Hizmetlerin Tanımı",
                text: "POLO SIM, kullanıcılara desteklenen ülkelerde mobil veriye erişim imkânı sunan dijital eSIM ürünleri sağlamaktadır. Hizmetlerimiz yalnızca veri bağlantısıyla sınırlı olup açıkça belirtilmediği sürece geleneksel sesli aramaları veya SMS'i kapsamaz.",
            },
            {
                heading: "3. Hesap Oluşturma",
                text: "Bir eSIM satın almak için hesap oluşturmanız gerekebilir. Hesap bilgilerinizin gizliliğini korumak ve hesabınız altında gerçekleştirilen tüm faaliyetlerden siz sorumlusunuz.",
            },
            {
                heading: "4. Siparişler ve Ödeme",
                text: "Tüm siparişler stok durumuna ve onayımıza tabidir. Fiyatlar seçtiğiniz para biriminde gösterilir ve geçerli vergiler uygulanabilir. Ödeme sayfasında gösterilen başlıca kredi kartları ve diğer ödeme yöntemlerini kabul ediyoruz.",
            },
            {
                heading: "5. eSIM Teslimatı ve Aktivasyonu",
                text: "Başarılı bir satın alma işleminin ardından eSIM QR kodunuz kayıtlı e-posta adresinize iletilecektir. Satın almadan önce cihazınızın eSIM uyumlu ve kilitsiz olduğundan emin olmak sizin sorumluluğunuzdadır.",
            },
            {
                heading: "6. Kabul Edilebilir Kullanım",
                text: "Hizmetlerimizi yasadışı amaçlarla, yetkisiz şekilde eSIM yeniden satışı için ya da ağımızı veya hizmetlerimizi aksatacak herhangi bir faaliyette kullanmamayı kabul ediyorsunuz.",
            },
            {
                heading: "7. Sorumluluğun Sınırlandırılması",
                text: "POLO SIM, şebeke operatörlerinin neden olduğu hizmet kesintileri dahil olmak üzere hizmetlerimizin kullanımından veya kullanılamamasından kaynaklanan dolaylı, tesadüfi veya sonuçsal zararlardan sorumlu tutulamaz.",
            },
            {
                heading: "8. Hizmet Değişiklikleri",
                text: "Hizmetlerimizin herhangi bir bölümünü istediğimiz zaman değiştirme, askıya alma veya sonlandırma hakkını saklı tutuyoruz. Mümkün olan durumlarda makul bir bildirim yapacağız.",
            },
            {
                heading: "9. Geçerli Hukuk",
                text: "Bu Koşullar Türkiye Cumhuriyeti hukukuna tabidir. Herhangi bir anlaşmazlık İstanbul mahkemelerinde çözüme kavuşturulacaktır.",
            },
            {
                heading: "10. İletişim",
                text: "Bu Koşullar hakkındaki sorularınız için support@polosim.com adresinden bizimle iletişime geçebilirsiniz.",
            },
        ],
    },
};

export default function TermsOfServicePage() {
    const t = useTranslations('Legal');
    const locale = useLocale();
    const [pageData, setPageData] = useState<Page | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        pageService.getPage('terms-of-service', locale)
            .then(data => setPageData(data))
            .catch(err => console.log('CMS Page fetch failed:', err.message))
            .finally(() => setIsLoading(false));
    }, [locale]);

    const c = content[locale as "en" | "tr"] ?? content.en;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-6">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            );
        }

        if (pageData?.content) {
            // Simplified rendering of HTML content if provided
            return (
                <div 
                    className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: pageData.content }}
                />
            );
        }

        // Fallback to static content
        return (
            <div className="space-y-8">
                {c.sections.map((section) => (
                    <div key={section.heading}>
                        <h2 className="text-xl font-semibold text-foreground mb-3">{section.heading}</h2>
                        <p className="text-muted-foreground leading-relaxed">{section.text}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <section className="pt-40 pb-12 px-4 relative overflow-hidden bg-gray-100 dark:bg-zinc-950">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-6">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{pageData?.title || t('termsOfService.title')}</span>
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-3">{pageData?.title || t('termsOfService.title')}</h1>
                    <p className="text-muted-foreground mb-6">
                        {pageData?.updated_at 
                            ? t('lastUpdated', { date: new Date(pageData.updated_at).toLocaleDateString(locale) })
                            : t('lastUpdated', { date: c.lastUpdated.split(': ')[1] })
                        }
                    </p>
                    <a href={c.downloadHref} download>
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            {t('downloadLabel')}
                        </Button>
                    </a>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    {renderContent()}

                    <div className="mt-12 pt-8 border-t border-border/50">
                        <Link href="/">
                            <Button variant="ghost" className="gap-2 text-primary">
                                <ArrowLeft className="w-4 h-4" />
                                {t('backLabel')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
