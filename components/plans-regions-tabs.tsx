"use client";

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
      iconBg: "bg-[#FFF4E5]",
    },
    {
      icon: "📊",
      title: t('monitorUsage.title'),
      description: t('monitorUsage.description'),
      iconBg: "bg-[#E8F5E9]",
    },
    {
      icon: "🤝",
      title: t('affiliateProgram.title'),
      description: t('affiliateProgram.description'),
      iconBg: "bg-[#EDE7F6]",
    },
    {
      icon: "🎁",
      title: t('exclusiveCampaigns.title'),
      description: t('exclusiveCampaigns.description'),
      iconBg: "bg-[#FCE4EC]",
    },
  ];

  return (
    <section className="py-16 px-[5%] bg-[#D4AF37]/10 text-center">
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <h2 className="text-[28px] md:text-[32px] font-bold mb-3 text-white">
          {t('title')}
        </h2>
        <p className="text-[var(--gray-text)] text-[14px] md:text-[15px] max-w-[500px] mx-auto mb-10 leading-[1.6]">
          {t('subtitle')}
        </p>

        {/* Benefits Grid - 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 text-left border border-transparent hover:border-[var(--gold)]/30 hover:shadow-lg transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${benefit.iconBg} flex items-center justify-center text-xl mb-4`}>
                {benefit.icon}
              </div>
              <h4 className="text-[15px] font-bold text-[var(--text-dark)] mb-2">{benefit.title}</h4>
              <p className="text-[13px] text-[var(--gray-text)] leading-[1.6]">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className="inline-flex items-center gap-2 bg-[var(--gold)] text-white border-none rounded-full px-8 py-3 font-semibold text-[14px] cursor-pointer hover:bg-[var(--gold-light)] transition-all shadow-md"
          onClick={() => router.push("/get-started")}
        >
          {t('createAccount')}
        </button>
      </div>
    </section>
  );
}
