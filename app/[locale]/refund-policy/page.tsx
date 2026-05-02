"use client";

import { Download, RotateCcw, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { pageService, type Page } from "@/lib/services";

const content = {
    en: {
        title: "Refund Policy",
        lastUpdated: "Last updated: March 2025",
        downloadLabel: "Download PDF / DOCX",
        downloadHref: "/policy/en/POLO_SIM_Refund_Policy_EN.docx",
        backLabel: "Back to Home",
        sections: [
            {
                heading: "1. Overview",
                text: "At POLO SIM, we want you to be fully satisfied with your purchase. This Refund Policy outlines the conditions under which refunds are granted for our eSIM products and services.",
            },
            {
                heading: "2. Eligibility for Refund",
                text: "A full refund may be requested within 30 days of purchase if the eSIM has not been installed or activated. Once an eSIM QR code has been scanned and the profile is installed on a device, it is considered activated and is no longer eligible for a refund.",
            },
            {
                heading: "3. Non-Refundable Situations",
                text: "Refunds will not be issued if: (a) the eSIM has been activated or installed, (b) more than 30 days have passed since the purchase date, (c) the issue is caused by the user's device being incompatible or carrier-locked, or (d) data has been partially consumed.",
            },
            {
                heading: "4. Technical Issues",
                text: "If you experience a technical issue that prevents the eSIM from working correctly and our support team is unable to resolve it within a reasonable timeframe, you may be eligible for a full or partial refund at our discretion.",
            },
            {
                heading: "5. How to Request a Refund",
                text: "To request a refund, contact our support team at support@polosim.com with your order number, the email address used during purchase, and a brief description of your issue. We will respond within 2 business days.",
            },
            {
                heading: "6. Refund Processing Time",
                text: "Approved refunds will be processed within 5–10 business days. The refund will be credited to the original payment method used during purchase.",
            },
            {
                heading: "7. Currency",
                text: "Refunds are processed in the same currency as the original transaction. Exchange rate fluctuations are beyond our control and we cannot be responsible for any related losses.",
            },
            {
                heading: "8. Changes to This Policy",
                text: "We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting to our website.",
            },
            {
                heading: "9. Contact",
                text: "For refund-related inquiries, please contact us at support@polosim.com.",
            },
        ],
    },
    tr: {
        title: "İade Politikası",
        lastUpdated: "Son güncelleme: Mart 2025",
        downloadLabel: "PDF / DOCX İndir",
        downloadHref: "/policy/tr/POLO_SIM_Iade_Politikasi_TR.docx",
        backLabel: "Ana Sayfaya Dön",
        sections: [
            {
                heading: "1. Genel Bakış",
                text: "POLO SIM olarak satın alımınızdan tamamen memnun olmanızı istiyoruz. Bu İade Politikası, eSIM ürünlerimiz ve hizmetlerimiz için iade yapılacak koşulları açıklamaktadır.",
            },
            {
                heading: "2. İade Hakkı Koşulları",
                text: "eSIM kurulmamış veya etkinleştirilmemişse satın alma tarihinden itibaren 30 gün içinde tam iade talep edilebilir. Bir eSIM QR kodu tarandıktan ve profil bir cihaza yüklendikten sonra etkinleştirilmiş sayılır ve artık iade için uygun değildir.",
            },
            {
                heading: "3. İade Yapılmayan Durumlar",
                text: "Aşağıdaki durumlarda iade yapılmaz: (a) eSIM etkinleştirilmiş veya yüklenmiş ise, (b) satın alma tarihinden itibaren 30 günden fazla geçmişse, (c) sorun kullanıcının cihazının uyumsuz veya operatöre kilitli olmasından kaynaklanıyorsa veya (d) veri kısmen tüketilmişse.",
            },
            {
                heading: "4. Teknik Sorunlar",
                text: "eSIM'in düzgün çalışmasını engelleyen teknik bir sorunla karşılaşırsanız ve destek ekibimiz sorunu makul bir süre içinde çözemezse, takdirimize bağlı olarak tam veya kısmi iade almaya hak kazanabilirsiniz.",
            },
            {
                heading: "5. İade Nasıl Talep Edilir",
                text: "İade talebinde bulunmak için sipariş numaranız, satın alım sırasında kullandığınız e-posta adresiniz ve sorununuzun kısa bir açıklamasıyla support@polosim.com adresinden destek ekibimizle iletişime geçin. 2 iş günü içinde yanıt vereceğiz.",
            },
            {
                heading: "6. İade İşlem Süresi",
                text: "Onaylanan iadeler 5–10 iş günü içinde işleme alınır. İade, satın alım sırasında kullanılan orijinal ödeme yöntemine geri yüklenecektir.",
            },
            {
                heading: "7. Para Birimi",
                text: "İadeler orijinal işlemle aynı para biriminde işleme alınır. Döviz kuru dalgalanmaları kontrolümüz dışındadır ve bu konudaki kayıplardan sorumlu tutulamayız.",
            },
            {
                heading: "8. Bu Politikadaki Değişiklikler",
                text: "Bu İade Politikasını istediğimiz zaman değiştirme hakkını saklı tutuyoruz. Değişiklikler web sitemizde yayınlandığı anda yürürlüğe girer.",
            },
            {
                heading: "9. İletişim",
                text: "İadeyle ilgili sorularınız için lütfen support@polosim.com adresinden bizimle iletişime geçin.",
            },
        ],
    },
};

export default function RefundPolicyPage() {
    const t = useTranslations('Legal');
    const locale = useLocale();
    const [pageData, setPageData] = useState<Page | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        pageService.getPage('refund-policy', locale)
            .then(data => setPageData(data))
            .catch(err => console.log('CMS Page fetch failed:', err.message))
            .finally(() => setIsLoading(false));
    }, [locale]);

    const c = content[locale as "en" | "tr"] ?? content.en;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
                </div>
            );
        }

        if (pageData?.content) {
            return (
                <div 
                    className="prose max-w-none prose-h2:text-[var(--text-dark)] prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-p:text-[var(--gray-text)] prose-p:leading-relaxed prose-p:mb-4 font-['DM_Sans']"
                    dangerouslySetInnerHTML={{ __html: pageData.content }}
                />
            );
        }

        return (
            <div className="space-y-10">
                {c.sections.map((section) => (
                    <div key={section.heading}>
                        <h2 className="text-xl font-bold text-[var(--text-dark)] mb-3.5 font-['Sora']">{section.heading}</h2>
                        <p className="text-[var(--gray-text)] leading-relaxed text-[15px]">{section.text}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero */}
            <section className="bg-[var(--navy)] pt-14 pb-12 px-[5%] text-center">
                <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
                    Legal Policy
                </div>
                <h1 className="text-[38px] font-extrabold text-white mb-3 tracking-tight">
                    {pageData?.title || t('refundPolicy.title')}
                </h1>
                <p className="text-[15px] text-white/60 mb-8">
                    {pageData?.updated_at 
                        ? t('lastUpdated', { date: new Date(pageData.updated_at).toLocaleDateString(locale) })
                        : c.lastUpdated
                    }
                </p>
                <div className="flex justify-center">
                    <a href={c.downloadHref} download className="no-underline">
                        <Button className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white border-none rounded-3xl px-8 h-12 font-bold transition-all shadow-lg flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            {t('downloadLabel')}
                        </Button>
                    </a>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-[5%]">
                <div className="max-w-3xl mx-auto">
                    {renderContent()}

                    <div className="mt-16 pt-8 border-t border-[var(--gray-mid)] text-center">
                        <Link href="/" className="inline-flex items-center gap-2 text-[var(--gold)] font-bold hover:opacity-70 transition-all no-underline">
                            <ArrowLeft className="w-4 h-4" />
                            {t('backLabel')}
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
