"use client";

import { Smartphone, Signal, Users, Gift, ArrowRight } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function PlansRegionsTabs() {
  const router = useRouter();
  const t = useTranslations('AccountBenefits');

  const benefits = [
    {
      icon: "📦",
      title: t('trackOrders.title'),
      description: t('trackOrders.description'),
      iconBg: "bg-[#FFF0E0]",
    },
    {
      icon: "📊",
      title: t('monitorUsage.title'),
      description: t('monitorUsage.description'),
      iconBg: "bg-[#E0F5F0]",
    },
    {
      icon: "🤝",
      title: t('affiliateProgram.title'),
      description: t('affiliateProgram.description'),
      iconBg: "bg-[#EDE8FF]",
    },
    {
      icon: "🎁",
      title: t('exclusiveCampaigns.title'),
      description: t('exclusiveCampaigns.description'),
      iconBg: "bg-[#FFE8EE]",
    },
  ];

  return (
    <section className="py-20 sm:py-24 px-[5%] bg-white text-center">
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <h2 className="text-[36px] font-extrabold mb-4 text-[var(--text-dark)] font-['Sora']">
          Neden Hesap Oluşturmalısınız?
        </h2>
        <p className="text-[var(--gray-text)] text-[16px] max-w-[600px] mx-auto mb-16 leading-[1.6]">
          Ücretsiz bir hesapla özel avantajların kilidini açın ve eSIM'lerinizi kolayca yönetin.
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-[#F9FAFB] rounded-2xl p-8 text-left border border-transparent hover:border-[var(--gold)]/30 hover:bg-white hover:shadow-xl transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${benefit.iconBg} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                {benefit.icon}
              </div>
              <h4 className="text-[17px] font-bold text-[var(--text-dark)] mb-3 font-['Sora'] group-hover:text-[var(--gold)] transition-colors">{benefit.title}</h4>
              <p className="text-[14px] text-[var(--gray-text)] leading-[1.6]">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="inline-flex items-center gap-2 bg-[var(--gold)] text-white border-none rounded-xl px-10 py-4 font-['Sora'] font-bold text-[15px] cursor-pointer hover:bg-[var(--gold-light)] hover:translate-y-[-2px] transition-all shadow-lg"
          onClick={() => router.push("/sign-in")}
        >
          Ücretsiz Hesap Oluştur ›
        </button>
      </div>
    </section>
  );
}
