"use client";

import { Download, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { pageService, type Page } from "@/lib/services";

const content = {
    en: {
        title: "Privacy Policy",
        lastUpdated: "Last updated: March 2025",
        downloadLabel: "Download PDF / DOCX",
        downloadHref: "/policy/en/POLO_SIM_Privacy_Policy_EN.docx",
        backLabel: "Back to Home",
        sections: [
            {
                heading: "1. Introduction",
                text: "POLO SIM ('we', 'us', or 'our') is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or purchase our eSIM products.",
            },
            {
                heading: "2. Information We Collect",
                text: "We may collect personal information such as your name, email address, payment information, device identifiers, and usage data when you register an account, make a purchase, or contact our support team.",
            },
            {
                heading: "3. How We Use Your Information",
                text: "We use your information to process transactions, deliver eSIM activation codes, provide customer support, send transactional emails, improve our services, and comply with legal obligations.",
            },
            {
                heading: "4. Data Sharing",
                text: "We do not sell your personal data. We may share information with trusted third-party service providers (e.g., payment processors, eSIM network operators) solely to fulfil the services you requested.",
            },
            {
                heading: "5. Data Retention",
                text: "We retain your personal data for as long as your account is active or as required to provide services and meet legal obligations. You may request deletion of your data at any time.",
            },
            {
                heading: "6. Your Rights",
                text: "Depending on your jurisdiction, you may have the right to access, correct, delete, or port your personal data, and to object to or restrict certain processing activities. Contact us at privacy@polosim.com to exercise these rights.",
            },
            {
                heading: "7. Cookies",
                text: "We use essential and analytical cookies to operate our website and understand usage patterns. You can manage cookie preferences via your browser settings or our Cookie Consent banner.",
            },
            {
                heading: "8. Security",
                text: "We implement industry-standard security measures, including TLS encryption and secure payment gateways, to protect your data from unauthorized access.",
            },
            {
                heading: "9. Changes to This Policy",
                text: "We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on our website.",
            },
            {
                heading: "10. Contact Us",
                text: "If you have questions about this policy, please contact us at privacy@polosim.com.",
            },
        ],
    },
    tr: {
        title: "Gizlilik Politikası",
        lastUpdated: "Son güncelleme: Mart 2025",
        downloadLabel: "PDF / DOCX İndir",
        downloadHref: "/policy/tr/POLO_SIM_Gizlilik_Politikasi_TR.docx",
        backLabel: "Ana Sayfaya Dön",
        sections: [
            {
                heading: "1. Giriş",
                text: "POLO SIM ('biz', 'bizim' veya 'şirketimiz') kişisel bilgilerinizi korumaya kararlıdır. Bu Gizlilik Politikası; web sitemizi ziyaret ettiğinizde veya eSIM ürünlerimizi satın aldığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı, ifşa ettiğimizi ve koruduğumuzu açıklamaktadır.",
            },
            {
                heading: "2. Topladığımız Bilgiler",
                text: "Hesap oluşturduğunuzda, satın alma yaptığınızda veya destek ekibimizle iletişime geçtiğinizde adınız, e-posta adresiniz, ödeme bilgileriniz, cihaz tanımlayıcılarınız ve kullanım verileriniz gibi kişisel bilgileri toplayabiliriz.",
            },
            {
                heading: "3. Bilgilerinizi Nasıl Kullanıyoruz",
                text: "Bilgilerinizi; işlemleri gerçekleştirmek, eSIM aktivasyon kodlarını teslim etmek, müşteri desteği sağlamak, işlemsel e-postalar göndermek, hizmetlerimizi iyileştirmek ve yasal yükümlülükleri yerine getirmek için kullanıyoruz.",
            },
            {
                heading: "4. Veri Paylaşımı",
                text: "Kişisel verilerinizi satmıyoruz. Talep ettiğiniz hizmetleri yerine getirmek amacıyla yalnızca güvenilir üçüncü taraf hizmet sağlayıcılarıyla (ör. ödeme işlemcileri, eSIM ağ operatörleri) bilgi paylaşabiliriz.",
            },
            {
                heading: "5. Veri Saklama",
                text: "Kişisel verilerinizi hesabınız aktif olduğu sürece veya hizmet sunumu ve yasal yükümlülükler için gerekli olduğu müddetçe saklarız. İstediğiniz zaman verilerinizin silinmesini talep edebilirsiniz.",
            },
            {
                heading: "6. Haklarınız",
                text: "Bulunduğunuz yargı bölgesine bağlı olarak kişisel verilerinize erişme, düzeltme, silme veya taşıma hakkına; belirli işleme faaliyetlerine itiraz etme veya kısıtlama hakkına sahip olabilirsiniz. Bu haklarınızı kullanmak için privacy@polosim.com adresine başvurunuz.",
            },
            {
                heading: "7. Çerezler",
                text: "Web sitemizi işletmek ve kullanım kalıplarını anlamak için zorunlu ve analitik çerezler kullanıyoruz. Çerez tercihlerinizi tarayıcı ayarlarınız veya Çerez Onay banner'ımız aracılığıyla yönetebilirsiniz.",
            },
            {
                heading: "8. Güvenlik",
                text: "Verilerinizi yetkisiz erişimden korumak için TLS şifreleme ve güvenli ödeme ağ geçitleri dahil olmak üzere sektör standardı güvenlik önlemlerini uyguluyoruz.",
            },
            {
                heading: "9. Bu Politikadaki Değişiklikler",
                text: "Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler hakkında sizi e-posta veya web sitemizde belirgin bir duyuru ile bilgilendireceğiz.",
            },
            {
                heading: "10. Bize Ulaşın",
                text: "Bu politika hakkında sorularınız için lütfen privacy@polosim.com adresinden bizimle iletişime geçin.",
            },
        ],
    },
};

export default function PrivacyPolicyPage() {
    const t = useTranslations('Legal');
    const locale = useLocale();
    const [pageData, setPageData] = useState<Page | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        pageService.getPage('privacy', locale)
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
                    {pageData?.title || t('privacyPolicy.title')}
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
