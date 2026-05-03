"use client";
import { useState, useEffect } from "react";
import { Twitter, Instagram, Facebook, Linkedin } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { menuService, type MenuItem } from "@/lib/services";

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

export function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const [dynamicLinks, setDynamicLinks] = useState<MenuItem[]>([]);

  useEffect(() => {
    menuService.getMenu('footer', locale)
      .then((data: any) => {
        const items = data?.items || data?.data?.items;
        if (items?.length > 0) {
          setDynamicLinks(items);
        }
      })
      .catch((err) => console.log('Footer menu fetch failed:', err.message));
  }, [locale]);

  const defaultFooterLinks = {
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
      { name: t('links.helpCenter'), href: "/support" },
      { name: t('links.contactUs'), href: "/support" },
      { name: t('links.setupGuide'), href: "/how-it-works" },
      { name: t('links.deviceCompatibility'), href: "/how-it-works" },
    ],
    legal: [
      { name: t('links.privacyPolicy'), href: "/privacy" },
      { name: t('links.termsOfService'), href: "/terms-of-service" },
      { name: t('links.refundPolicy'), href: "/refund-policy" },
    ],
  };

  // If we have dynamic links, we might want to prioritize them or merge them.
  // For now, if dynamicLinks has children (categories), we'll use them.
  const categories = dynamicLinks.length > 0 ? dynamicLinks : null;

  const renderColumn = (title: string, links: { name: string; href: string }[]) => (
    <div>
      <h5 className="text-[13px] font-bold text-white mb-4">{title}</h5>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.name}>
            <Link href={link.href} className="text-[13px] text-white/50 hover:text-[var(--gold)] cursor-pointer transition-colors">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-[var(--navy)]">
      <div className="max-w-[1440px] mx-auto px-[5%] pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 pb-12 border-b border-white/10 mb-8">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center mb-6 cursor-pointer">
              <Image
                src="/logo.png"
                alt="POLO SIM - One Sim One World"
                width={400}
                height={140}
                className="h-20 sm:h-24 w-auto brightness-110"
              />
            </Link>
            <p className="text-[14px] text-white/50 leading-[1.8] mb-8 max-w-[320px]">
              {t('description')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-[40px] h-[40px] rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/50 cursor-pointer transition-all hover:bg-[var(--gold)] hover:text-white hover:scale-110"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Links columns or Defaults */}
          {categories ? (
            categories.map((category) => (
              <div key={category.id}>
                <h5 className="text-[13px] font-bold text-white mb-4">{category.title}</h5>
                <ul className="flex flex-col gap-2.5">
                  {category.children?.map((link) => (
                    <li key={link.id}>
                      {link.url.startsWith('http') ? (
                        <a href={link.url} target={link.target} className="text-[13px] text-white/50 hover:text-[var(--gold)] cursor-pointer transition-colors">
                          {link.title}
                        </a>
                      ) : (
                        <Link href={link.url} className="text-[13px] text-white/50 hover:text-[var(--gold)] cursor-pointer transition-colors">
                          {link.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              {renderColumn(t('product'), defaultFooterLinks.product)}
              {renderColumn(t('company'), defaultFooterLinks.company)}
              {renderColumn(t('support'), defaultFooterLinks.support)}
              {renderColumn(t('legal'), defaultFooterLinks.legal)}
            </>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/35">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--gold)] text-[8px]">●</span>
              {t('bottom.available')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--gold)] text-[8px]">●</span>
              {t('bottom.secure')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
