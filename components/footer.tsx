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
      title: "Ürün",
      links: [
        { name: "Destinasyonlar", href: "/plans" },
        { name: "Veri Planları", href: "/plans" },
        { name: "Bölgeler", href: "/plans?view=regions" },
        { name: "Haberler/Kaynaklar", href: "#" },
      ],
    },
    {
      title: "Şirket",
      links: [
        { name: "Hakkımızda", href: "#" },
        { name: "Kariyer", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Basın", href: "#" },
      ],
    },
    {
      title: "Destek",
      links: [
        { name: "Yardım Merkezi", href: "/support" },
        { name: "İletişim", href: "/support" },
        { name: "Kurulum Kılavuzu", href: "/how-it-works" },
        { name: "Cihaz Uyumluluğu", href: "/how-it-works" },
      ],
    },
    {
      title: "Yasal",
      links: [
        { name: "Gizlilik Politikası", href: "/privacy" },
        { name: "Kullanım Şartları", href: "/terms-of-service" },
        { name: "Sözleşme & Koşullar", href: "/terms-of-service" },
        { name: "İade Politikası", href: "/refund-policy" },
      ],
    },
  ];

  // If we have dynamic links, we might want to prioritize them or merge them.
  const categories = dynamicLinks.length > 0 ? dynamicLinks : null;

  return (
    <footer className="bg-[var(--navy)]">
      <div className="max-w-[1200px] mx-auto px-[5%] pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-10 border-b border-white/10 mb-6">
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
            <p className="text-[12px] text-white/50 leading-[1.7] mb-6 max-w-[280px]">
              Bir Sim, Tüm Dünya. 200&apos;den fazla ülkede gerçek eSIM'ler alın ve bağlantıda kalarak sınırsız iletişimin tadını çıkarın.
            </p>
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
                  {column.links.map((link) => (
                    <li key={link.name}>
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

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/40">
          <p>
            © {new Date().getFullYear()} POLO SIM. Tüm Hakları Saklıdır.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--gold)] text-[6px]">●</span>
              Dünya Çapında Kullanılabilir
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--gold)] text-[6px]">●</span>
              Güvenli Ödeme
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--gold)] text-[6px]">●</span>
              Güvenli İşlemler
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
