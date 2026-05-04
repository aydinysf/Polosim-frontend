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
      iconBgClass: "bg-[#F3E8FF]",
      iconColorClass: "text-[#7C3AED]",
    },
    {
      icon: CreditCard,
      title: t('easyTopUps.title'),
      description: t('easyTopUps.description'),
      iconBgClass: "bg-[#FFE4E6]",
      iconColorClass: "text-[#E11D48]",
    },
    {
      icon: Headphones,
      title: t('support247.title'),
      description: t('support247.description'),
      iconBgClass: "bg-[#E0F2FE]",
      iconColorClass: "text-[#0284C7]",
    },
  ];

  return (
    <section className="py-24 px-[5%] bg-[#F9FAFB] text-center">
      <div className="max-w-[1240px] mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <h2 className="text-[32px] md:text-[42px] font-extrabold mb-5 text-[var(--navy)] font-['Sora'] tracking-tight">
            Neden POLO SIM?
          </h2>
          <p className="text-[var(--gray-text)] text-[16px] md:text-[18px] max-w-[700px] mx-auto leading-relaxed font-medium">
            En son teknoloji eSIM teknolojimizle mobil bağlantının geleceğini deneyimleyin.
          </p>
        </div>

        {/* Main features - Navy cards with Gold Border */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[var(--navy)] rounded-xl p-8 text-left border-[1.5px] border-[var(--gold)] flex items-start gap-6 transition-all hover:translate-y-[-4px] hover:shadow-2xl shadow-lg relative group"
            >
              <div className="flex-shrink-0 w-16 h-16 rounded-full border-[1.5px] border-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[18px] font-bold text-[var(--gold)] mb-2 font-['Sora']">
                  {feature.title}
                </h3>
                <p className="text-[13px] text-white/70 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Strip - Single White Bar */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {additionalFeatures.map((feature) => (
              <div
                key={feature.title}
                className="py-6 px-10 flex items-center gap-5 text-left hover:bg-gray-50/50 transition-colors cursor-default"
              >
                <div className={`w-11 h-11 rounded-xl ${feature.iconBgClass} flex items-center justify-center shrink-0`}>
                  <feature.icon className={`w-5 h-5 ${feature.iconColorClass}`} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[var(--text-dark)] mb-0.5 font-['Sora']">
                    {feature.title}
                  </h4>
                  <p className="text-[12px] text-[var(--gray-text)] font-medium">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
