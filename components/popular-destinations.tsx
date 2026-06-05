"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const destinations = [
  { name: "Europe", countries: "40+ countries", price: "$4.99", icon: "🇪🇺", popular: true },
  { name: "Asia", countries: "30+ countries", price: "$3.99", icon: "🌏", popular: true },
  { name: "North America", countries: "3 countries", price: "$5.99", icon: "🌎", popular: false },
  { name: "Africa", countries: "25+ countries", price: "$6.99", icon: "🌍", popular: false },
  { name: "Middle East", countries: "15+ countries", price: "$5.49", icon: "🕌", popular: false },
  { name: "Oceania", countries: "10+ countries", price: "$7.99", icon: "🦘", popular: false },
];

export function PopularDestinations() {
  const t = useTranslations('PopularDestinations');

  return (
    <section className="py-[72px] px-[5%] bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
            {t('badge')}
          </div>
          <h2 className="text-[32px] font-extrabold mb-3 text-[var(--text-dark)]">
            {t('title')}
          </h2>
          <p className="text-[var(--gray-text)] text-base max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Region Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((destination) => (
            <Link
              key={destination.name}
              href={`/plans?search=${destination.name}`}
              className="group bg-[var(--gray-bg)] rounded-2xl px-5 py-4 text-center border-[1.5px] border-transparent hover:border-[var(--gold)] transition-all cursor-pointer hover:translate-y-[-2px] no-underline"
            >
              <span className="text-[32px] block mb-2">{destination.icon}</span>
              <h3 className="text-[14px] font-bold text-[var(--text-dark)] mb-0.5">{destination.name}</h3>
              <p className="text-[11px] text-[var(--gray-text)] mb-1 flex items-center justify-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {destination.countries}
              </p>
              <p className="text-[14px] font-bold text-[var(--gold)]">{destination.price}</p>
              {destination.popular && (
                <span className="inline-block mt-1.5 bg-[rgba(201,168,76,0.15)] text-[var(--gold)] text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {t('popular')}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-8">
          <Link
            href="/plans?view=regions"
            className="inline-flex items-center gap-2 text-[var(--gold)] font-['Sora'] font-bold text-sm hover:opacity-70 transition-opacity no-underline"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
