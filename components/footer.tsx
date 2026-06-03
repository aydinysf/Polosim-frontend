"use client";
import { useState, useEffect } from "react";
import { Twitter, Instagram, Facebook, Linkedin, ChevronDown } from "lucide-react";
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
  const [contactOpen, setContactOpen] = useState(false);

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
    <>
      <footer className="bg-[var(--navy)]">
        <div className="max-w-7xl mx-auto px-8 pt-14 pb-8">

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

          {/* Contact Info — collapsible accordion */}
          <div className="border-t border-white/10">
            {/* Toggle header */}
            <button
              onClick={() => setContactOpen((prev) => !prev)}
              className="w-full flex items-center justify-between py-5 text-left group"
              aria-expanded={contactOpen}
            >
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
                {t('contact.title')}
              </p>
              <ChevronDown
                className={`w-4 h-4 text-white/40 group-hover:text-[var(--gold)] transition-all duration-300 ${
                  contactOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Collapsible content with CSS transition */}
            <div
              className="overflow-hidden transition-all duration-400 ease-in-out"
              style={{
                maxHeight: contactOpen ? '400px' : '0px',
                opacity: contactOpen ? 1 : 0,
              }}
            >
              <div className="pb-8">
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

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center gap-3">
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/491637866961"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.5)] flex items-center justify-center hover:bg-[#1ebe5d] hover:scale-110 transition-all duration-200"
          aria-label="WhatsApp ile iletişime geçin"
          title="WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
        
        {/* Google Play Square Icon */}
        <a
          href="https://play.google.com/store/apps/details?id=com.polosim.app&hl=tr"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-[14px] bg-black shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 border border-white/20"
          aria-label="Get it on Google Play"
          title="Google Play Store"
        >
          <svg viewBox="0 0 512 512" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
            <path fill="#2196f3" d="M37.5 13.9v484.2c0 9.8 11.2 15.5 19.1 9.8l217-156.4L188 266 37.5 13.9z"/>
            <path fill="#ffc107" d="M381.5 158.4L273.6 235.1 188 266l85.6 30.9 107.9 76.7c7.5 5.3 17.6 1.3 17.6-7.8V166.2c0-9.1-10.1-13.1-17.6-7.8z"/>
            <path fill="#f44336" d="M37.5 13.9L188 266l85.6-30.9-204-145c-8.9-6.3-21.7-.5-21.7 10.3v-2.2z"/>
            <path fill="#4caf50" d="M37.5 498.1v2.2c0 10.8 12.8 16.6 21.7 10.3l204-145-85.6-30.9L37.5 498.1z"/>
          </svg>
        </a>
        
        {/* App Store Square Icon */}
        <a
          href="https://apps.apple.com/tr/app/polosim-esim-data-for-travel/id6758249182?l=tr"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-[14px] bg-[#0A84FF] shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 border border-white/20"
          aria-label="Download on App Store"
          title="iOS App Store"
        >
          <svg viewBox="0 0 384 512" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
          </svg>
        </a>
      </div>
    </>
  );
}
