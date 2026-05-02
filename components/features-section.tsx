import { Zap, Shield, Globe, Clock, CreditCard, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";

export function FeaturesSection() {
  const t = useTranslations('Features');

  const features = [
    {
      icon: Zap,
      title: t('instantActivation.title'),
      description: t('instantActivation.description'),
    },
    {
      icon: Shield,
      title: t('noRoamingFees.title'),
      description: t('noRoamingFees.description'),
    },
    {
      icon: Globe,
      title: t('globalCoverage.title'),
      description: t('globalCoverage.description'),
    },
  ];

  const additionalFeatures = [
    {
      icon: Clock,
      title: t('flexibleValidity.title'),
      description: t('flexibleValidity.description'),
      iconBgClass: "bg-[#EDE8FF]",
    },
    {
      icon: CreditCard,
      title: t('easyTopUps.title'),
      description: t('easyTopUps.description'),
      iconBgClass: "bg-[#FFE8EE]",
    },
    {
      icon: Headphones,
      title: t('support247.title'),
      description: t('support247.description'),
      iconBgClass: "bg-[#E0EEFF]",
    },
  ];

  return (
    <section className="py-16 sm:py-[72px] px-[5%] bg-[var(--gray-bg)] text-center">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-10 sm:mb-12">
          <h2 className="text-[32px] font-extrabold mb-3 text-[var(--text-dark)]">
            {t('title')}
          </h2>
          <p className="text-[var(--gray-text)] text-base max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Main features - navy cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[var(--navy)] rounded-2xl p-7 text-left transition-all hover:translate-y-[-2px]"
            >
              <div className="w-[52px] h-[52px] rounded-xl bg-[rgba(201,168,76,0.15)] flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <h3 className="text-[15px] font-bold text-[var(--gold)] mb-2.5 font-['Sora']">{feature.title}</h3>
              <p className="text-[13px] text-white/65 leading-[1.6]">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Additional features bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {additionalFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl py-[18px] px-5 flex items-center gap-3.5 text-left"
            >
              <div className={`w-9 h-9 rounded-lg ${feature.iconBgClass} flex items-center justify-center shrink-0`}>
                <feature.icon className="w-[18px] h-[18px] text-[var(--text-dark)]" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[var(--text-dark)] mb-0.5 font-['Sora']">{feature.title}</h4>
                <p className="text-[12px] text-[var(--gray-text)]">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
