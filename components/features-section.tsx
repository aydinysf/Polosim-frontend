"use client";

import { Zap, X, Globe, Clock, CreditCard, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";

export function FeaturesSection() {
  const t = useTranslations('Features');

  const mainFeatures = [
    {
      icon: Zap,
      title: t('instantActivation.title'),
      description: t('instantActivation.description'),
    },
    {
      icon: X,
      title: t('noRoaming.title'),
      description: t('noRoaming.description'),
    },
    {
      icon: Globe,
      title: t('globalCoverage.title'),
      description: t('globalCoverage.description'),
    },
  ];

  const bottomFeatures = [
    {
      icon: Clock,
      title: t('flexibleOptions.title'),
      description: t('flexibleOptions.description'),
      iconBg: "bg-[#FFF4E5]",
      iconColor: "text-[#F59E0B]",
    },
    {
      icon: CreditCard,
      title: t('easyTopUp.title'),
      description: t('easyTopUp.description'),
      iconBg: "bg-[#E8F5E9]",
      iconColor: "text-[#22C55E]",
    },
    {
      icon: Headphones,
      title: t('support247.title'),
      description: t('support247.description'),
      iconBg: "bg-[#E0F2FE]",
      iconColor: "text-[#0EA5E9]",
    },
  ];

  return (
    <>
      {/* Main Features Section - Navy Background */}
      <section className="py-14 px-[5%] bg-[var(--navy)] text-center">
        <div className="max-w-[1100px] mx-auto">
          {/* Section header */}
          <div className="mb-10">
            <h2 className="text-[28px] md:text-[32px] font-bold mb-3 text-white">
              {t('title')}
            </h2>
            <p className="text-white/60 text-[14px] md:text-[15px] max-w-[550px] mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          {/* Feature Cards - 3 columns with gold borders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mainFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-[var(--navy-mid)] rounded-xl p-6 text-left border border-[var(--gold)] flex items-start gap-4 transition-all hover:translate-y-[-2px] hover:shadow-xl"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[var(--gold)] flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[15px] font-bold text-[var(--gold)] mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-[12px] text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Features Strip - Light Background */}
      <section className="py-10 px-[5%] bg-[#F5F7FA]">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-[var(--gray-mid)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {bottomFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="py-5 px-6 flex items-center gap-4 text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${feature.iconBg} flex items-center justify-center shrink-0`}>
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[var(--text-dark)] mb-0.5">
                      {feature.title}
                    </h4>
                    <p className="text-[12px] text-[var(--gray-text)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
