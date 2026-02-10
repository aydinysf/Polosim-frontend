import { Zap, Shield, Globe, Clock, CreditCard, Headphones } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function FeaturesSection() {
  const t = useTranslations('Features');

  const features = [
    {
      icon: Zap,
      title: t('instantActivation.title'),
      description: t('instantActivation.description'),
      image: "/images/feature-instant.jpg",
      gradient: "from-blue-600/15 via-cyan-500/10 to-blue-400/5",
      accentColor: "text-cyan-400",
      borderColor: "hover:border-cyan-400/50",
      iconBg: "bg-blue-500/15 border-blue-500/25",
      iconColor: "text-blue-500",
    },
    {
      icon: Shield,
      title: t('noRoamingFees.title'),
      description: t('noRoamingFees.description'),
      image: "/images/feature-noroaming.jpg",
      gradient: "from-emerald-600/15 via-teal-500/10 to-green-400/5",
      accentColor: "text-emerald-400",
      borderColor: "hover:border-emerald-400/50",
      iconBg: "bg-emerald-500/15 border-emerald-500/25",
      iconColor: "text-emerald-500",
    },
    {
      icon: Globe,
      title: t('globalCoverage.title'),
      description: t('globalCoverage.description'),
      image: "/images/feature-global.jpg",
      gradient: "from-amber-500/15 via-orange-400/10 to-yellow-300/5",
      accentColor: "text-amber-400",
      borderColor: "hover:border-amber-400/50",
      iconBg: "bg-amber-500/15 border-amber-500/25",
      iconColor: "text-amber-500",
    },
  ];

  const additionalFeatures = [
    {
      icon: Clock,
      title: t('flexibleValidity.title'),
      description: t('flexibleValidity.description'),
      iconBg: "bg-violet-500/15 border-violet-500/25",
      iconColor: "text-violet-500",
    },
    {
      icon: CreditCard,
      title: t('easyTopUps.title'),
      description: t('easyTopUps.description'),
      iconBg: "bg-rose-500/15 border-rose-500/25",
      iconColor: "text-rose-500",
    },
    {
      icon: Headphones,
      title: t('support247.title'),
      description: t('support247.description'),
      iconBg: "bg-sky-500/15 border-sky-500/25",
      iconColor: "text-sky-500",
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-foreground md:text-4xl">
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            {t('subtitle')}
          </p>
        </div>

        {/* Main features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm transition-all duration-300 ${feature.borderColor} hover:scale-[1.02]`}
            >
              {/* Feature image */}
              <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/40 to-transparent" />
              </div>
              
              <div className="relative z-10 p-5 sm:p-6 -mt-8">
                {/* Icon */}
                <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl ${feature.iconBg} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 sm:w-7 h-6 sm:h-7 ${feature.iconColor}`} />
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional features bar */}
        <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-card/40 via-card/60 to-card/40 backdrop-blur-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex items-center gap-4 ${
                  index < additionalFeatures.length - 1 ? "md:border-r md:border-border/30" : ""
                } md:px-4`}
              >
                <div className={`w-10 h-10 rounded-lg ${feature.iconBg} border flex items-center justify-center shrink-0`}>
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
