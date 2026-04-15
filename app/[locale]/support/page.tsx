"use client";

import {
  MessageCircle, Mail, Phone, FileText, HelpCircle,
  ChevronDown, ChevronRight, Search, Clock,
  Wifi, Smartphone, CreditCard, Globe, Settings,
  AlertCircle, Sparkles, ArrowRight, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { faqService, type Faq } from "@/lib/services";
import { Skeleton } from "@/components/ui/skeleton";

const supportCategories = [
  {
    icon: Smartphone,
    title: "Installation & Setup",
    description: "Step-by-step guides for eSIM activation",
    articles: 12,
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "group-hover:border-cyan-500/50",
    iconColor: "text-cyan-400"
  },
  {
    icon: Wifi,
    title: "Connectivity",
    description: "Troubleshoot network and speed problems",
    articles: 8,
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "group-hover:border-emerald-500/50",
    iconColor: "text-emerald-400"
  },
  {
    icon: CreditCard,
    title: "Billing & Plans",
    description: "Payments, refunds, and data usage",
    articles: 10,
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "group-hover:border-purple-500/50",
    iconColor: "text-purple-400"
  },
  {
    icon: Globe,
    title: "Coverage",
    description: "Global destinations and network partners",
    articles: 15,
    color: "from-orange-500/20 to-amber-500/20",
    borderColor: "group-hover:border-orange-500/50",
    iconColor: "text-orange-400"
  },
  {
    icon: Settings,
    title: "My Account",
    description: "Manage orders and profile settings",
    articles: 6,
    color: "from-rose-500/20 to-pink-500/20",
    borderColor: "group-hover:border-rose-500/50",
    iconColor: "text-rose-400"
  },
  {
    icon: AlertCircle,
    title: "Troubleshooting",
    description: "Technical issues and bug reports",
    articles: 4,
    color: "from-sky-500/20 to-blue-500/20",
    borderColor: "group-hover:border-sky-500/50",
    iconColor: "text-sky-400"
  },
];

const popularArticles = [
  { title: "How to install an eSIM on iPhone", icon: Smartphone },
  { title: "How to install an eSIM on Android", icon: Smartphone },
  { title: "My eSIM is not connecting to the network", icon: Wifi },
  { title: "How to check remaining data balance", icon: FileText },
  { title: "Can I use eSIM and physical SIM together?", icon: Sparkles },
  { title: "How to top up my existing eSIM", icon: CreditCard },
];

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is an eSIM and how does it work?",
        a: "An eSIM (embedded SIM) is a digital SIM that allows you to activate a cellular plan without using a physical SIM card. It's built into your device and can be programmed with different carrier profiles.",
      },
      {
        q: "Is my device compatible with eSIM?",
        a: "Most smartphones released after 2018 support eSIM, including iPhone XS and newer, Samsung Galaxy S20+, and Google Pixel 3+. Check your device settings for 'eSIM' or 'Add Cellular Plan'.",
      },
      {
        q: "How quickly will I receive my eSIM?",
        a: "Your eSIM QR code is delivered instantly via email immediately after your purchase is confirmed. No waiting for physical delivery.",
      },
    ],
  },
  {
    category: "Technical",
    questions: [
      {
        q: "How do I activate roaming for my eSIM?",
        a: "Go to your device settings, select the POLO SIM profile, and ensure 'Data Roaming' is toggled ON. This is required for our global data plans to function.",
      },
      {
        q: "Can I use my eSIM on multiple devices?",
        a: "No, an eSIM profile can typically only be installed once. Deleting it from a device usually renders the profile invalid. Please install it on the primary device you intend to use.",
      },
    ],
  },
];

const contactMethods = [
  {
    icon: MessageCircle,
    title: "24/7 Live Chat",
    description: "Real-time support via chat",
    badge: "Fastest",
    action: "Launch Chat",
    primary: true,
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "support@polosim.com",
    badge: "< 2h response",
    action: "Send Email",
    primary: false,
  },
  {
    icon: Phone,
    title: "Direct Call",
    description: "+1 (800) POLO-SIM",
    badge: "VIP Line",
    action: "Call Now",
    primary: false,
  },
];

export default function SupportPage() {
  const t = useTranslations("Support");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [dynamicFaqs, setDynamicFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    faqService.getFaqs(locale)
      .then(data => setDynamicFaqs(data))
      .catch(err => console.error("Failed to fetch FAQs:", err))
      .finally(() => setIsLoading(false));
  }, [locale]);

  const toggleFaq = (key: string) => {
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  const renderFaqs = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      );
    }

    if (dynamicFaqs.length > 0) {
      return (
        <div className="space-y-4">
          {dynamicFaqs.map((faq, index) => {
             const key = `faq-dynamic-${faq.id}`;
             const isExpanded = expandedFaq === key;
             return (
               <div
                 key={key}
                 className={`rounded-2xl border transition-all duration-300 ${
                   isExpanded
                     ? "border-primary/40 bg-card/80"
                     : "border-border/50 bg-card/60"
                 }`}
               >
                 <button
                   onClick={() => toggleFaq(key)}
                   className="w-full flex items-center justify-between p-6 text-left"
                 >
                   <span
                     className={`font-semibold text-lg ${
                       isExpanded ? "text-primary" : "text-foreground"
                     }`}
                   >
                     {faq.question}
                   </span>
                   <div
                     className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                       isExpanded
                         ? "bg-primary border-primary rotate-180"
                         : "border-border/50 bg-card"
                     }`}
                   >
                     <ChevronDown
                       className={`w-4 h-4 ${
                         isExpanded ? "text-primary-foreground" : "text-muted-foreground"
                       }`}
                     />
                   </div>
                 </button>
                 {isExpanded && (
                   <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                     <div 
                        className="text-muted-foreground leading-relaxed text-base prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                   </div>
                 )}
               </div>
             );
          })}
        </div>
      );
    }

    // Fallback to static
    return (
      <div className="space-y-4">
        {["general.q1", "general.q2", "general.q3", "technical.q1", "technical.q2"].map(
          (faqKey, index) => {
            const key = `faq-static-${index}`;
            const isExpanded = expandedFaq === key;
            return (
              <div
                key={key}
                className={`rounded-2xl border transition-all duration-300 ${
                  isExpanded
                    ? "border-primary/40 bg-card/80"
                    : "border-border/50 bg-card/60"
                }`}
              >
                <button
                  onClick={() => toggleFaq(key)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span
                    className={`font-semibold text-lg ${
                      isExpanded ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {t(`faq.${faqKey}.question`)}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      isExpanded
                        ? "bg-primary border-primary rotate-180"
                        : "border-border/50 bg-card"
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 ${
                        isExpanded ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {t(`faq.${faqKey}.answer`)}
                    </p>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 relative overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(14,116,144,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,116,144,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("hero.badge")}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
            {t("hero.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto group">
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-2 transition-all duration-300 group-focus-within:border-primary/50 group-focus-within:bg-card shadow-2xl overflow-hidden">
              <div className="absolute inset-x-0 h-[1px] top-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 flex-1 pl-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t("hero.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-lg py-6"
                  />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20">
                  {t("hero.searchButton")}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700"
            >
              {t("hero.installationLink")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Column: FAQ */}
            <div className="lg:col-span-8 space-y-16">
              <div className="pt-8">
                <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                  <div className="w-1 h-8 bg-primary rounded-full" />
                  {t("sections.commonQuestions")}
                </h2>
                <div className="space-y-4">
                  {renderFaqs()}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-white border border-primary/10 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:animate-pulse">
                  <MessageCircle className="w-24 h-24 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2 italic">
                  {t("contact.title")}
                </h3>
                <p className="text-muted-foreground mb-8">{t("contact.subtitle")}</p>

                <div className="space-y-4">
                  <a
                    href={t("contact.whatsappUrl")}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-4 p-4 rounded-xl border bg-primary border-primary text-primary-foreground hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all duration-300"
                    aria-label={t("contact.methods.liveChat.action")}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-sm font-bold">
                        {t("contact.methods.liveChat.title")}
                      </div>
                      <div className="text-[10px] font-medium opacity-70 text-blue-100">
                        {t("contact.methods.liveChat.badge")}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
