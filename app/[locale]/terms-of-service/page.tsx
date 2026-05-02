"use client";

import { Download, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { pageService, type Page } from "@/lib/services";

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
                    {pageData?.title || t('termsOfService.title')}
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
