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
    <section className="py-16 sm:py-[72px] px-[5%] bg-white text-center">
      <div className="max-w-[900px] mx-auto">
        {/* Section header */}
        <h2 className="text-[32px] font-extrabold mb-3 text-[var(--text-dark)]">
          {t('title')}
        </h2>
        <p className="text-[var(--gray-text)] text-base max-w-[480px] mx-auto mb-12 leading-[1.6]">
          {t('subtitle')}
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-[var(--gray-bg)] rounded-2xl p-6 text-left"
            >
              <div className={`w-11 h-11 rounded-xl ${benefit.iconBg} flex items-center justify-center text-xl mb-3.5`}>
                {benefit.icon}
              </div>
              <h4 className="text-sm font-bold text-[var(--text-dark)] mb-2 font-['Sora']">{benefit.title}</h4>
              <p className="text-[13px] text-[var(--gray-text)] leading-[1.6]">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="inline-flex items-center gap-2 bg-[var(--gold)] text-white border-none rounded-3xl px-8 py-3.5 font-['Sora'] font-bold text-[15px] cursor-pointer hover:bg-[var(--gold-light)] hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(201,168,76,0.3)] transition-all"
          onClick={() => router.push("/sign-in")}
        >
          {t('createAccount')} ›
        </button>
      </div>
    </section>
  );
}
