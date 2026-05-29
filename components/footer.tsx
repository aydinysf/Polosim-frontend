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

  const footerColumns = [
    {
      title: t('product'),
      links: [
        { name: t('links.destinations'), href: "/plans" },
        { name: t('links.dataPlans'), href: "/plans" },
        { name: t('links.regions'), href: "/plans?view=regions" },
        { name: t('links.coverageMap'), href: "#" },
      ],
    },
    {
      title: t('company'),
      links: [
        { name: t('links.aboutUs'), href: "#" },
        { name: t('links.careers'), href: "#" },
        { name: t('links.blog'), href: "#" },
        { name: t('links.press'), href: "#" },
      ],
    },
    {
      title: t('support'),
      links: [
        { name: t('links.helpCenter'), href: "/support" },
        { name: t('links.contactUs'), href: "/support" },
        { name: t('links.setupGuide'), href: "/how-it-works" },
        { name: t('links.deviceCompatibility'), href: "/how-it-works" },
      ],
    },
    {
      title: t('legal'),
      links: [
        { name: t('links.privacyPolicy'), href: "/privacy" },
        { name: t('links.termsOfService'), href: "/terms-of-service" },
        { name: t('links.termsOfService'), href: "/terms-of-service" },
        { name: t('links.refundPolicy'), href: "/refund-policy" },
      ],
    },
  ];

  // If we have dynamic links, we might want to prioritize them or merge them.
  const categories = dynamicLinks.length > 0 ? dynamicLinks : null;

  return (
    <footer className="bg-[var(--navy)]">
      <div className="max-w-[1200px] mx-auto px-[5%] pt-14 pb-8">

        {/* Top section: Logo + nav columns */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-10 border-b border-white/10 mb-0">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center mb-5 cursor-pointer">
              <Image
                src="/logo.png"
                alt="POLO SIM - One Sim One World"
                width={180}
                height={60}
                className="h-14 w-auto brightness-110"
              />
            </Link>
            {/* Social icons right under logo */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/50 cursor-pointer transition-all hover:bg-[var(--gold)] hover:text-white hover:border-[var(--gold)]"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {categories ? (
            categories.map((category) => (
              <div key={category.id}>
                <h5 className="text-[12px] font-bold text-white mb-3 uppercase tracking-wide">{category.title}</h5>
                <ul className="flex flex-col gap-2">
                  {category.children?.map((link) => (
                    <li key={link.id}>
                      {link.url.startsWith('http') ? (
                        <a href={link.url} target={link.target} className="text-[12px] text-white/50 hover:text-[var(--gold)] cursor-pointer transition-colors">
                          {link.title}
                        </a>
                      ) : (
                        <Link href={link.url} className="text-[12px] text-white/50 hover:text-[var(--gold)] cursor-pointer transition-colors">
                          {link.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            footerColumns.map((column) => (
              <div key={column.title}>
                <h5 className="text-[12px] font-bold text-white mb-3 uppercase tracking-wide">{column.title}</h5>
                <ul className="flex flex-col gap-2">
                  {column.links.map((link, idx) => (
                    <li key={`${link.name}-${idx}`}>
                      <Link href={link.href} className="text-[12px] text-white/50 hover:text-[var(--gold)] cursor-pointer transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Contact Info — separated by a divider */}
        <div className="border-t border-white/10 py-8 mb-0">
          <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-4">
            {t('contact.title')}
          </p>
          <p className="text-[12px] text-white font-semibold mb-4">Check for Trips GmbH</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
            <p className="text-[11px] text-white/50">
              <span className="text-[var(--gold-pale)] font-semibold">{t('contact.address')}: </span>
              Hintergasse 6, 65428 Rüsselsheim, Hessen/Germany
            </p>
            <p className="text-[11px] text-white/50">
              <span className="text-[var(--gold-pale)] font-semibold">{t('contact.phone')}: </span>
              <a href="tel:+4961423019620" className="hover:text-[var(--gold)] transition-colors">+49-6142-3019620</a>
            </p>
            <p className="text-[11px] text-white/50">
              <span className="text-[var(--gold-pale)] font-semibold">{t('contact.fax')}: </span>
              +49-6142-173624
            </p>
            <p className="text-[11px] text-white/50">
              <span className="text-[var(--gold-pale)] font-semibold">{t('contact.email')}: </span>
              <a href="mailto:info@checkfortrips.de" className="hover:text-[var(--gold)] transition-colors">info@checkfortrips.de</a>
            </p>
            <p className="text-[11px] text-white/50">
              <span className="text-[var(--gold-pale)] font-semibold">{t('contact.web')}: </span>
              <a href="https://www.checkfortrips.de" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)] transition-colors">www.checkfortrips.de</a>
            </p>
            <p className="text-[11px] text-white/50">
              <span className="text-[var(--gold-pale)] font-semibold">{t('contact.taxNo')}: </span>
              DE310315188
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/40">
          <p>
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--gold)] text-[6px]">●</span>
              {t('bottom.available')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--gold)] text-[6px]">●</span>
              {t('bottom.secure')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
