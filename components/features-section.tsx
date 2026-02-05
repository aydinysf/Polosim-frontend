import { Zap, Shield, Globe, Clock, CreditCard, Headphones } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Activation",
    description: "Get connected in minutes. No waiting for physical SIM delivery - just scan the QR code and you're online.",
  },
  {
    icon: Shield,
    title: "No Roaming Fees",
    description: "Say goodbye to expensive roaming charges. Our transparent pricing means no surprise bills when you return home.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Coverage in 200+ countries and territories. One eSIM for all your international travel needs.",
  },
];

const additionalFeatures = [
  {
    icon: Clock,
    title: "Flexible Validity",
    description: "Plans from 7 days to 30 days",
  },
  {
    icon: CreditCard,
    title: "Easy Top-ups",
    description: "Add more data anytime, anywhere",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Expert help whenever you need it",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 px-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-foreground md:text-4xl">
            Why Choose POLO SIM?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
            Experience the future of mobile connectivity with our cutting-edge eSIM technology.
          </p>
        </div>

        {/* Main features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-8 transition-all duration-300 hover:border-primary/50 hover:bg-card/50"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                {/* Icon container */}
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 sm:w-7 h-6 sm:h-7 text-primary" />
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>

              {/* Decorative number - hidden on mobile */}
              <span className="hidden sm:block absolute top-6 right-6 text-8xl font-bold text-border/30 pointer-events-none">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        {/* Additional features bar */}
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex items-center gap-4 ${
                  index < additionalFeatures.length - 1 ? "md:border-r md:border-border/30" : ""
                } md:px-4`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
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
