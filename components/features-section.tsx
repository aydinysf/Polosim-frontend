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
    <section className="py-24 px-[5%] bg-white text-center">
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <h2 className="text-[36px] font-extrabold mb-4 text-[var(--text-dark)] font-['Sora']">
            Neden POLO SIM?
          </h2>
          <p className="text-[var(--gray-text)] text-[16px] max-w-[600px] mx-auto leading-[1.6]">
            En son teknoloji eSIM teknolojimizle mobil bağlantının geleceğini deneyimleyin.
          </p>
        </div>

        {/* Main features - navy cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[var(--navy)] rounded-2xl p-10 text-left transition-all hover:translate-y-[-4px] shadow-xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
              <div className="w-[64px] h-[64px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:border-[var(--gold)]/50 transition-colors">
                <feature.icon className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h3 className="text-[19px] font-bold text-white mb-4 font-['Sora'] group-hover:text-[var(--gold)] transition-colors">{feature.title}</h3>
              <p className="text-[14px] text-white/60 leading-[1.7]">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Additional features bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {additionalFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#F9FAFB] rounded-2xl py-[24px] px-8 flex items-center gap-5 text-left border border-transparent hover:border-[var(--gold)]/20 hover:bg-white hover:shadow-lg transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.iconBgClass} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-[22px] h-[22px] text-[var(--text-dark)]" />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[var(--text-dark)] mb-1 font-['Sora'] group-hover:text-[var(--gold)] transition-colors">{feature.title}</h4>
                <p className="text-[13px] text-[var(--gray-text)]">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
