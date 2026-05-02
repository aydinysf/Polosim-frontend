"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/routing";

const destinations = [
  { name: "Europe", countries: "40+ countries", price: "$4.99", icon: "🇪🇺", popular: true },
  { name: "Asia", countries: "30+ countries", price: "$3.99", icon: "🌏", popular: true },
  { name: "North America", countries: "3 countries", price: "$5.99", icon: "🌎", popular: false },
  { name: "Africa", countries: "25+ countries", price: "$6.99", icon: "🌍", popular: false },
  { name: "Middle East", countries: "15+ countries", price: "$5.49", icon: "🕌", popular: false },
  { name: "Oceania", countries: "10+ countries", price: "$7.99", icon: "🦘", popular: false },
];

export function PopularDestinations() {
  return (
    <section className="py-[72px] px-[5%] bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[rgba(201,168,76,0.15)] text-[var(--gold)] border border-[rgba(201,168,76,0.3)] rounded-full px-4 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase mb-5">
            Popular Regions
          </div>
          <h2 className="text-[32px] font-extrabold mb-3 text-[var(--text-dark)]">
            Dünya'yı Keşfet
          </h2>
          <p className="text-[var(--gray-text)] text-base max-w-xl mx-auto">
            En popüler bölge planlarımızdan birini seçin ve yolculuğunuzun sizi götürdüğü her yerde bağlantıda kalın.
          </p>
        </div>

        {/* Region Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((destination) => (
            <Link
              key={destination.name}
              href={`/plans?search=${destination.name}`}
              className="group bg-[var(--gray-bg)] rounded-2xl p-5 text-center border-[1.5px] border-transparent hover:border-[var(--gold)] transition-all cursor-pointer hover:translate-y-[-2px] no-underline"
            >
              <span className="text-[40px] block mb-3">{destination.icon}</span>
              <h3 className="text-[15px] font-bold text-[var(--text-dark)] mb-1">{destination.name}</h3>
              <p className="text-[12px] text-[var(--gray-text)] mb-2 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                {destination.countries}
              </p>
              <p className="text-[15px] font-bold text-[var(--gold)]">{destination.price}</p>
              {destination.popular && (
                <span className="inline-block mt-2 bg-[rgba(201,168,76,0.15)] text-[var(--gold)] text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Popüler
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
            Tüm Bölgeleri Görüntüle
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
