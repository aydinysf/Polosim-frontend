import { Twitter, Instagram, Facebook, Linkedin } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#", hoverColor: "hover:bg-sky-500/25 hover:text-sky-300 hover:border-sky-500/50" },
  { name: "Instagram", icon: Instagram, href: "#", hoverColor: "hover:bg-rose-500/25 hover:text-rose-300 hover:border-rose-500/50" },
  { name: "Facebook", icon: Facebook, href: "#", hoverColor: "hover:bg-blue-500/25 hover:text-blue-300 hover:border-blue-500/50" },
  { name: "LinkedIn", icon: Linkedin, href: "#", hoverColor: "hover:bg-cyan-500/25 hover:text-cyan-300 hover:border-cyan-500/50" },
];

export function Footer() {
  const t = useTranslations('Footer');

  const footerLinks = {
    product: [
      { name: t('links.destinations'), href: "/plans" },
      { name: t('links.dataPlans'), href: "/plans" },
      { name: t('links.regions'), href: "/plans?view=regions" },
      { name: t('links.coverageMap'), href: "#" },
    ],
    company: [
      { name: t('links.aboutUs'), href: "#" },
      { name: t('links.careers'), href: "#" },
      { name: t('links.blog'), href: "#" },
      { name: t('links.press'), href: "#" },
    ],
    support: [
      { name: t('links.helpCenter'), href: "#" },
      { name: t('links.contactUs'), href: "#" },
      { name: t('links.setupGuide'), href: "#" },
      { name: t('links.deviceCompatibility'), href: "#" },
    ],
    legal: [
      { name: t('links.privacyPolicy'), href: "#" },
      { name: t('links.termsOfService'), href: "#" },
      { name: t('links.refundPolicy'), href: "#" },
    ],
  };

  return (
    <footer className="relative overflow-hidden bg-[hsl(215_40%_14%)]">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16">
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 sm:gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <a href="/" className="flex items-center mb-4 cursor-pointer">
              <Image
                src="/logo.png"
                alt="POLO SIM - One Sim One World"
                width={360}
                height={120}
                className="h-16 sm:h-20 md:h-28 w-auto brightness-110"
              />
            </a>
            <p className="text-[hsl(215_20%_60%)] text-sm mb-6 max-w-xs leading-relaxed">
              {t('description')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[hsl(215_20%_55%)] cursor-pointer transition-all ${social.hoverColor}`}
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-cyan-400">{t('product')}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-xs sm:text-sm text-[hsl(215_20%_55%)] hover:text-white cursor-pointer transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-cyan-400">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-xs sm:text-sm text-[hsl(215_20%_55%)] hover:text-white cursor-pointer transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-cyan-400">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-xs sm:text-sm text-[hsl(215_20%_55%)] hover:text-white cursor-pointer transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-cyan-400">{t('legal')}</h4>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-xs sm:text-sm text-[hsl(215_20%_55%)] hover:text-white cursor-pointer transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-[hsl(215_20%_45%)] text-center md:text-left">
            &copy; 2026 POLO SIM. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-[hsl(215_20%_45%)]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Available in 200+ countries
            </span>
            <span className="hidden sm:inline text-white/15">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Secure payments
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
