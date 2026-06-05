"use client";

import { MessageCircle, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { faqService, type Faq } from "@/lib/services";
import { pageService, type Page } from "@/lib/services/pageService";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchHeader } from "@/components/search-header";

export default function SupportPage() {
  const t = useTranslations("Support");
  const locale = useLocale();

  const quickLinks = [
    { icon: "📖", title: t('quickLinks.setup.title'), desc: t('quickLinks.setup.desc'), href: "/how-it-works" },
    { icon: "📦", title: t('quickLinks.status.title'), desc: t('quickLinks.status.desc'), href: "#" },
    { icon: "📶", title: t('quickLinks.troubleshoot.title'), desc: t('quickLinks.troubleshoot.desc'), href: "#" },
    { icon: "💳", title: t('quickLinks.payment.title'), desc: t('quickLinks.payment.desc'), href: "#" },
  ];

  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [dynamicFaqs, setDynamicFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageData, setPageData] = useState<Page | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    faqService.getAll(locale)
      .then((data: Faq[]) => setDynamicFaqs(data))
      .catch((err: Error) => console.error("Failed to fetch FAQs:", err))
      .finally(() => setIsLoading(false));
  }, [locale]);

  useEffect(() => {
    setIsPageLoading(true);
    pageService.getPage("support", locale)
      .then((data) => setPageData(data))
      .catch(() => setPageData(null))
      .finally(() => setIsPageLoading(false));
  }, [locale]);

  const toggleFaq = (key: string) => {
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  const renderFaqs = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    const faqItems = dynamicFaqs.length > 0
      ? dynamicFaqs.map((faq) => ({
          key: `faq-dynamic-${faq.id}`,
          question: faq.question,
          answer: faq.answer,
          isHtml: true,
        }))
      : ["general.q1", "general.q2", "general.q3", "technical.q1", "technical.q2"].map((faqKey, index) => ({
          key: `faq-static-${index}`,
          question: t(`faq.${faqKey}.question`),
          answer: t(`faq.${faqKey}.answer`),
          isHtml: false,
        }));

    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {faqItems.map((faq) => {
          const isExpanded = expandedFaq === faq.key;
          return (
            <div
              key={faq.key}
              className={`bg-white rounded-xl border overflow-hidden transition-colors ${
                isExpanded ? "border-[var(--gold)]/60 shadow-sm" : "border-[var(--gray-mid)]"
              }`}
            >
              <button
                onClick={() => toggleFaq(faq.key)}
                className="w-full text-left bg-transparent border-none py-[18px] px-5 font-['Sora'] text-[15px] font-semibold text-[var(--text-dark)] cursor-pointer flex justify-between items-center gap-4 hover:text-[var(--gold)] transition-colors"
              >
                {faq.question}
                <span className={`w-6 h-6 rounded-full bg-[var(--gray-bg)] flex items-center justify-center text-[12px] shrink-0 transition-transform ${isExpanded ? "rotate-180 text-[var(--gold)]" : ""}`}>
                  ▾
                </span>
              </button>
              {isExpanded && (
                <div className="px-5 pb-[18px] text-sm text-[var(--gray-text)] leading-[1.7] border-t border-[var(--gray-mid)]/30 pt-3">
                  {faq.isHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  ) : (
                    <p>{faq.answer}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isPageLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <section className="bg-[var(--navy)] pt-14 pb-12 px-[5%] text-center">
          <Skeleton className="h-7 w-32 mx-auto mb-5 rounded-full" />
          <Skeleton className="h-10 w-72 mx-auto mb-3" />
          <Skeleton className="h-5 w-[520px] max-w-full mx-auto" />
        </section>
        <section className="py-16 px-[5%]">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (pageData?.content) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <section className="bg-[var(--navy)] pt-14 pb-12 px-[5%] text-center">
          <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
            {t("hero.badge")}
          </div>
          <h1 className="text-4xl md:text-[36px] font-extrabold text-white mb-2 tracking-tight">
            {pageData.title}
          </h1>
          <p className="text-[15px] text-white/60 mb-8 leading-[1.6] max-w-lg mx-auto">
            {pageData.updated_at ? new Date(pageData.updated_at).toLocaleDateString(locale) : t("hero.subtitle")}
          </p>
        </section>

        <section className="py-16 px-[5%]">
          <div
            className="max-w-3xl mx-auto prose max-w-none prose-headings:text-[var(--text-dark)] prose-p:text-[var(--gray-text)] prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
          />
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <SearchHeader 
        title={t("hero.title")} 
        subtitle={t("hero.subtitle")} 
        badge={t("hero.badge")} 
      />

      {/* Unified Container Section */}
      <div className="bg-[#F5F7FA] py-12 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-[var(--gray-mid)] shadow-sm p-6 md:p-12 space-y-16">
          
          {/* Quick Links */}
          <div>
            <h2 className="text-xl font-extrabold text-[var(--navy)] text-center mb-8">{t("sections.commonQuestions")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((ql) => (
                <Link
                  key={ql.title}
                  href={ql.href}
                  className="flex items-center gap-3 bg-[var(--gray-bg)] border border-[var(--gray-mid)] rounded-xl p-4 cursor-pointer transition-all hover:border-[var(--gold)]/40 hover:bg-white no-underline"
                >
                  <div className="text-[22px] w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-[var(--gray-mid)]">
                    {ql.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-dark)] mb-0.5">{ql.title}</h4>
                    <p className="text-[12px] text-[var(--gray-text)]">{ql.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--gray-mid)]" />

          {/* FAQ Section */}
          <div>
            {renderFaqs()}
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--gray-mid)]" />

          {/* WhatsApp Card */}
          <div className="bg-[var(--gray-bg)] border border-[var(--gray-mid)] rounded-3xl p-8 text-center max-w-[540px] mx-auto">
            <span className="text-[40px] block mb-3">💬</span>
            <h3 className="text-[18px] font-bold mb-2 text-[var(--text-dark)]">{t("contact.title")}</h3>
            <p className="text-sm text-[var(--gray-text)] mb-6 leading-[1.6]">{t("contact.subtitle")}</p>
            <a
              href={t("contact.whatsappUrl")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white border-none rounded-3xl px-7 py-3 font-['Sora'] font-bold text-sm cursor-pointer hover:bg-[#1ebe5b] hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(37,211,102,0.2)] transition-all no-underline"
            >
              <MessageCircle className="w-4 h-4" />
              {t("contact.methods.liveChat.title")}
            </a>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
